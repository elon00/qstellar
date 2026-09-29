#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env,
    String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    NegativeAmount = 4,
    InsufficientBalance = 5,
    InsufficientAllowance = 6,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Decimals,
    Name,
    Symbol,
    TotalSupply,
    Balance(Address),
    Allowance(AllowanceDataKey),
}

#[derive(Clone)]
#[contracttype]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}

#[derive(Clone)]
#[contracttype]
pub struct AllowanceValue {
    pub amount: i128,
    pub live_until_ledger: u32,
}

const INSTANCE_BUMP_AMOUNT: u32 = 518400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 172800; // ~10 days

#[contract]
pub struct QstellarToken;

#[contractimpl]
impl QstellarToken {
    /// Initialize the QSTELLAR Token (SEP-41 compliant)
    pub fn initialize(
        env: Env,
        admin: Address,
        decimals: u32,
        name: String,
        symbol: String,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        Ok(())
    }

    /// Admin or authorized policy can mint new tokens
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        let balance_key = DataKey::Balance(to.clone());
        let current_balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&balance_key, &new_balance);

        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply + amount));

        env.events()
            .publish((symbol_short!("mint"), admin, to), amount);

        Ok(())
    }

    /// Transfer tokens between accounts
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);

        env.storage().persistent().set(&from_key, &(from_balance - amount));
        env.storage().persistent().set(&to_key, &(to_balance + amount));

        env.events()
            .publish((symbol_short!("transfer"), from, to), amount);

        Ok(())
    }

    /// Transfer tokens using approved allowance (e.g. x402 facilitator or AI agent)
    pub fn transfer_from(
        env: Env,
        spender: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        spender.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        let allowance_key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });
        let allowance: AllowanceValue = env
            .storage()
            .temporary()
            .get(&allowance_key)
            .ok_or(Error::InsufficientAllowance)?;

        if allowance.amount < amount || allowance.live_until_ledger < env.ledger().sequence() {
            return Err(Error::InsufficientAllowance);
        }

        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);

        env.storage().persistent().set(&from_key, &(from_balance - amount));
        env.storage().persistent().set(&to_key, &(to_balance + amount));

        let updated_allowance = AllowanceValue {
            amount: allowance.amount - amount,
            live_until_ledger: allowance.live_until_ledger,
        };
        env.storage()
            .temporary()
            .set(&allowance_key, &updated_allowance);

        env.events()
            .publish((symbol_short!("tr_from"), spender, from, to), amount);

        Ok(())
    }

    /// Burn tokens from caller account
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        let balance_key = DataKey::Balance(from.clone());
        let balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }

        env.storage().persistent().set(&balance_key, &(balance - amount));

        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply - amount));

        env.events().publish((symbol_short!("burn"), from), amount);

        Ok(())
    }

    /// Approve spender allowance with expiration ledger
    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        live_until_ledger: u32,
    ) -> Result<(), Error> {
        from.require_auth();

        if amount < 0 {
            return Err(Error::NegativeAmount);
        }

        let key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });
        let val = AllowanceValue {
            amount,
            live_until_ledger,
        };
        env.storage().temporary().set(&key, &val);

        env.events()
            .publish((symbol_short!("approve"), from, spender), amount);

        Ok(())
    }

    /// Query account balance
    pub fn balance(env: Env, id: Address) -> i128 {
        let key = DataKey::Balance(id);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    /// Query current allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let key = DataKey::Allowance(AllowanceDataKey { from, spender });
        if let Some(val) = env.storage().temporary().get::<_, AllowanceValue>(&key) {
            if val.live_until_ledger >= env.ledger().sequence() {
                return val.amount;
            }
        }
        0
    }

    /// Query total circulating supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Query decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap_or(7)
    }

    /// Query token name
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or_else(|| String::from_str(&env, "Qstellar"))
    }

    /// Query token symbol
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or_else(|| String::from_str(&env, "QST"))
    }
}

#[cfg(test)]
mod test;
