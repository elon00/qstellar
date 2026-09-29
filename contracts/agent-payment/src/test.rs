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
