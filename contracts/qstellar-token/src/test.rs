#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_token_initialization_and_minting() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, QstellarToken);
    let client = QstellarTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    client.initialize(
        &admin,
        &7u32,
        &String::from_str(&env, "Qstellar Token"),
        &String::from_str(&env, "QST"),
    );

    assert_eq!(client.decimals(), 7u32);
    assert_eq!(client.total_supply(), 0i128);

    // Mint tokens to user1
    client.mint(&user1, &1_000_000_0000000i128);
    assert_eq!(client.balance(&user1), 1_000_000_0000000i128);
    assert_eq!(client.total_supply(), 1_000_000_0000000i128);

    // Transfer from user1 to user2
    client.transfer(&user1, &user2, &400_000_0000000i128);
    assert_eq!(client.balance(&user1), 600_000_0000000i128);
    assert_eq!(client.balance(&user2), 400_000_0000000i128);

    // Burn tokens from user2
    client.burn(&user2, &100_000_0000000i128);
    assert_eq!(client.balance(&user2), 300_000_0000000i128);
    assert_eq!(client.total_supply(), 900_000_0000000i128);
}

#[test]
fn test_token_allowance_and_transfer_from() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, QstellarToken);
    let client = QstellarTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let spender = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.initialize(
        &admin,
        &7u32,
        &String::from_str(&env, "Qstellar Token"),
        &String::from_str(&env, "QST"),
    );

    client.mint(&user, &500_0000000i128);
    client.approve(&user, &spender, &200_0000000i128, &1000u32);

    assert_eq!(client.allowance(&user, &spender), 200_0000000i128);

    client.transfer_from(&spender, &user, &receiver, &150_0000000i128);
    assert_eq!(client.balance(&receiver), 150_0000000i128);
    assert_eq!(client.balance(&user), 350_0000000i128);
    assert_eq!(client.allowance(&user, &spender), 50_0000000i128);
}
