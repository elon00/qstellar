#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Bytes, Env, String, Symbol};

#[test]
fn test_service_registration_and_lookup() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let provider = Address::generate(&env);

    let contract_id = env.register_contract(None, ServiceRegistryContract);
    let client = ServiceRegistryContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    let dummy_pqc = Bytes::from_slice(&env, &[1, 2, 3, 4, 5]);

    client.register_service(
        &provider,
        &Symbol::new(&env, "AI_RESEARCH"),
        &String::from_str(&env, "https://api.qstellar.org/v1/research"),
        &500_0000i128, // 0.05 QST
        &Symbol::new(&env, "AI_LLM"),
        &dummy_pqc,
    );

    assert_eq!(client.service_count(), 1);

    let svc = client.get_service(&Symbol::new(&env, "AI_RESEARCH")).unwrap();
    assert_eq!(svc.price_x402, 500_0000i128);
    assert_eq!(svc.active, true);
    assert_eq!(svc.total_invocations, 0);

    // Record call
    client.record_call(&provider, &Symbol::new(&env, "AI_RESEARCH"));
    let updated = client.get_service(&Symbol::new(&env, "AI_RESEARCH")).unwrap();
    assert_eq!(updated.total_invocations, 1);
}
