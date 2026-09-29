#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env, Symbol};

#[test]
fn test_agent_escrow_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    // Register token contract mock
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = token::StellarAssetClient::new(&env, &token_id.address());

    // Register agent payment contract
    let payment_id = env.register_contract(None, AgentPaymentContract);
    let client = AgentPaymentContractClient::new(&env, &payment_id);
    client.initialize(&admin);

    let payer = Address::generate(&env);
    let agent = Address::generate(&env);

    // Mint tokens to payer
    token_client.mint(&payer, &1_000_0000000i128);

    // Create escrow
    let escrow_id = client.create_escrow(
        &payer,
        &agent,
        &token_id.address(),
        &250_0000000i128,
        &1000u32,
        &Symbol::new(&env, "TASK_AI_101"),
    );

    assert_eq!(escrow_id, 1);
    let escrow = client.get_escrow(&1).unwrap();
    assert_eq!(escrow.amount, 250_0000000i128);
    assert_eq!(escrow.state, EscrowState::Active);

    // Agent submits task proof
    let dummy_proof = BytesN::from_array(&env, &[7u8; 32]);
    client.complete_task(&agent, &1, &dummy_proof);

    // Release escrow
    client.release(&payer, &1);

    let updated_escrow = client.get_escrow(&1).unwrap();
    assert_eq!(updated_escrow.state, EscrowState::Completed);

    let agent_balance = token::Client::new(&env, &token_id.address()).balance(&agent);
    assert_eq!(agent_balance, 250_0000000i128);
}

#[test]
fn test_agent_policy_budget_and_overspend_protection() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = token::StellarAssetClient::new(&env, &token_id.address());

    let payment_id = env.register_contract(None, AgentPaymentContract);
    let client = AgentPaymentContractClient::new(&env, &payment_id);
    client.initialize(&admin);

    let payer = Address::generate(&env);
    let agent = Address::generate(&env);
    let api_provider = Address::generate(&env);

    token_client.mint(&payer, &100_0000000i128); // 100 QST

    // Set Policy: 10 QST Daily Budget, 1 QST Per-Call Cap
    client.set_agent_policy(&payer, &agent, &10_0000000i128, &1_0000000i128);

    let policy = client.get_agent_policy(&payer, &agent).unwrap();
    assert_eq!(policy.daily_budget, 10_0000000i128);
    assert_eq!(policy.per_call_cap, 1_0000000i128);
    assert_eq!(policy.spent_today, 0i128);

    // Call 1: 0.50 QST (Allowed, within cap)
    let remaining = client.spend_under_policy(
        &payer,
        &agent,
        &token_id.address(),
        &api_provider,
        &5000000i128,
        &Symbol::new(&env, "AI_CALL_1"),
    );
    assert_eq!(remaining, 9_5000000i128);

    // Call 2: Try to spend 2 QST (Exceeds per-call cap of 1 QST) -> Must Fail!
    let over_cap_res = client.try_spend_under_policy(
        &payer,
        &agent,
        &token_id.address(),
        &api_provider,
        &2_0000000i128,
        &Symbol::new(&env, "AI_CALL_OVERCAP"),
    );
    assert!(over_cap_res.is_err());
}
