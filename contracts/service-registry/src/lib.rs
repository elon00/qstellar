#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Bytes, Env,
    String, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RegistryError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    ServiceAlreadyExists = 4,
    ServiceNotFound = 5,
    InvalidPrice = 6,
}

#[derive(Clone)]
#[contracttype]
pub struct ServiceMetadata {
    pub service_id: Symbol,
    pub provider: Address,
    pub endpoint: String,
    pub price_x402: i128,
    pub category: Symbol,
    pub pqc_pubkey: Bytes,
    pub active: bool,
    pub total_invocations: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Service(Symbol),
    ServiceCount,
}

const INSTANCE_BUMP_AMOUNT: u32 = 518400;
const INSTANCE_LIFETIME_THRESHOLD: u32 = 172800;

#[contract]
pub struct ServiceRegistryContract;

#[contractimpl]
impl ServiceRegistryContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), RegistryError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(RegistryError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ServiceCount, &0u32);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        Ok(())
    }

    /// Register a new AI Agent or API service with x402 pricing
    pub fn register_service(
        env: Env,
        provider: Address,
        service_id: Symbol,
        endpoint: String,
        price_x402: i128,
        category: Symbol,
        pqc_pubkey: Bytes,
    ) -> Result<(), RegistryError> {
        provider.require_auth();

        if price_x402 < 0 {
            return Err(RegistryError::InvalidPrice);
        }

        let key = DataKey::Service(service_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(RegistryError::ServiceAlreadyExists);
        }

        let metadata = ServiceMetadata {
            service_id: service_id.clone(),
            provider: provider.clone(),
            endpoint,
            price_x402,
            category,
            pqc_pubkey,
            active: true,
            total_invocations: 0,
        };

        env.storage().persistent().set(&key, &metadata);

        let mut count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::ServiceCount)
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::ServiceCount, &count);

        env.events()
            .publish((symbol_short!("svc_reg"), provider), service_id);

        Ok(())
    }

    /// Update pricing or status of a service
    pub fn update_service(
        env: Env,
        provider: Address,
        service_id: Symbol,
        new_price: i128,
        active: bool,
    ) -> Result<(), RegistryError> {
        provider.require_auth();

        if new_price < 0 {
            return Err(RegistryError::InvalidPrice);
        }

        let key = DataKey::Service(service_id.clone());
        let mut metadata: ServiceMetadata = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(RegistryError::ServiceNotFound)?;

        if metadata.provider != provider {
            return Err(RegistryError::Unauthorized);
        }

        metadata.price_x402 = new_price;
        metadata.active = active;
        env.storage().persistent().set(&key, &metadata);

        env.events()
            .publish((symbol_short!("svc_upd"), provider), service_id);

        Ok(())
    }

    /// Record service invocation (increments counter)
    pub fn record_call(env: Env, caller: Address, service_id: Symbol) -> Result<(), RegistryError> {
        caller.require_auth();

        let key = DataKey::Service(service_id.clone());
        let mut metadata: ServiceMetadata = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(RegistryError::ServiceNotFound)?;

        metadata.total_invocations += 1;
        env.storage().persistent().set(&key, &metadata);

        Ok(())
    }

    /// Lookup service details
    pub fn get_service(env: Env, service_id: Symbol) -> Option<ServiceMetadata> {
        env.storage().persistent().get(&DataKey::Service(service_id))
    }

    /// Total registered services count
    pub fn service_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::ServiceCount)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
