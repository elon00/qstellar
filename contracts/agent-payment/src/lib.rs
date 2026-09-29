#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PaymentError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    EscrowNotFound = 4,
    InvalidState = 5,
    NegativeAmount = 6,
    Expired = 7,
    NotExpired = 8,
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum EscrowState {
    Active = 1,
    Completed = 2,
    Refunded = 3,
}

#[derive(Clone)]
#[contracttype]
pub struct Escrow {
    pub id: u64,
    pub payer: Address,
    pub agent: Address,
    pub token: Address,
    pub amount: i128,
    pub deadline_ledger: u32,
    pub state: EscrowState,
    pub task_id: Symbol,
    pub result_hash: Option<BytesN<32>>,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    EscrowCounter,
    Escrow(u64),
}

const INSTANCE_BUMP_AMOUNT: u32 = 518400;
const INSTANCE_LIFETIME_THRESHOLD: u32 = 172800;

#[contract]
pub struct AgentPaymentContract;

#[contractimpl]
impl AgentPaymentContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), PaymentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(PaymentError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::EscrowCounter, &0u64);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        Ok(())
    }

    /// Create an escrow deposit for an autonomous agent task
    pub fn create_escrow(
        env: Env,
        payer: Address,
        agent: Address,
        token_address: Address,
        amount: i128,
        deadline_ledger: u32,
        task_id: Symbol,
    ) -> Result<u64, PaymentError> {
        payer.require_auth();

        if amount <= 0 {
            return Err(PaymentError::NegativeAmount);
        }

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::EscrowCounter)
            .unwrap_or(0);
        counter += 1;

        // Transfer funds from payer into this contract
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&payer, &env.current_contract_address(), &amount);

        let escrow = Escrow {
            id: counter,
            payer: payer.clone(),
            agent: agent.clone(),
            token: token_address,
            amount,
            deadline_ledger,
            state: EscrowState::Active,
            task_id: task_id.clone(),
            result_hash: None,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(counter), &escrow);
        env.storage()
            .instance()
            .set(&DataKey::EscrowCounter, &counter);

        env.events()
            .publish((symbol_short!("esc_new"), payer, agent), (counter, amount));

        Ok(counter)
    }

    /// Agent submits task completion proof
    pub fn complete_task(
        env: Env,
        agent: Address,
        escrow_id: u64,
        result_hash: BytesN<32>,
    ) -> Result<(), PaymentError> {
        agent.require_auth();

        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(PaymentError::EscrowNotFound)?;

        if escrow.state != EscrowState::Active {
            return Err(PaymentError::InvalidState);
        }
        if escrow.agent != agent {
            return Err(PaymentError::Unauthorized);
        }

        escrow.result_hash = Some(result_hash.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        env.events().publish(
            (symbol_short!("esc_done"), agent),
            (escrow_id, result_hash),
        );

        Ok(())
    }

    /// Payer or Admin releases the escrow funds to the agent
    pub fn release(env: Env, caller: Address, escrow_id: u64) -> Result<(), PaymentError> {
        caller.require_auth();

        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(PaymentError::EscrowNotFound)?;

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PaymentError::NotInitialized)?;

        if caller != escrow.payer && caller != admin {
            return Err(PaymentError::Unauthorized);
        }
        if escrow.state != EscrowState::Active {
            return Err(PaymentError::InvalidState);
        }

        escrow.state = EscrowState::Completed;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        // Transfer funds from contract to the agent
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.agent,
            &escrow.amount,
        );

        env.events()
            .publish((symbol_short!("esc_rel"), escrow.agent), escrow.amount);

        Ok(())
    }

    /// Refund escrow to payer if deadline has expired and task not finalized
    pub fn refund(env: Env, payer: Address, escrow_id: u64) -> Result<(), PaymentError> {
        payer.require_auth();

        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(PaymentError::EscrowNotFound)?;

        if escrow.payer != payer {
            return Err(PaymentError::Unauthorized);
        }
        if escrow.state != EscrowState::Active {
            return Err(PaymentError::InvalidState);
        }
        if env.ledger().sequence() < escrow.deadline_ledger {
            return Err(PaymentError::NotExpired);
        }

        escrow.state = EscrowState::Refunded;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.payer,
            &escrow.amount,
        );

        env.events()
            .publish((symbol_short!("esc_ref"), payer), escrow.amount);

        Ok(())
    }

    /// Atomic direct settlement for x402 Bazaar protocol with authorization
    pub fn settle_x402(
        env: Env,
        payer: Address,
        facilitator: Address,
        provider: Address,
        token_address: Address,
        amount: i128,
        fee: i128,
        resource_id: Symbol,
    ) -> Result<(), PaymentError> {
        payer.require_auth();

        if amount <= 0 {
            return Err(PaymentError::NegativeAmount);
        }

        let token_client = token::Client::new(&env, &token_address);

        // Settle provider payment
        token_client.transfer(&payer, &provider, &amount);

        // Settle facilitator micro-fee if non-zero
        if fee > 0 {
            token_client.transfer(&payer, &facilitator, &fee);
        }

        env.events().publish(
            (symbol_short!("x402_set"), payer, provider),
            (resource_id, amount, fee),
        );

        Ok(())
    }

    /// Get escrow details
    pub fn get_escrow(env: Env, escrow_id: u64) -> Option<Escrow> {
        env.storage().persistent().get(&DataKey::Escrow(escrow_id))
    }
}

#[cfg(test)]
mod test;
