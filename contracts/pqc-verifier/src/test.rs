#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Bytes, Env};

#[test]
fn test_pqc_identity_and_verification() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let contract_id = env.register_contract(None, PqcVerifierContract);
    let client = PqcVerifierContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    // Create 1952 byte simulated ML-DSA-65 public key
    let mut pk_vec = [1u8; 1952];
    pk_vec[0] = 42;
    let pk_bytes = Bytes::from_slice(&env, &pk_vec);

    client.register_pqc_identity(&user, &pk_bytes);

    let id = client.get_identity(&user).unwrap();
    assert_eq!(id.ml_dsa_pubkey.len(), 1952);
    assert_eq!(id.verified_signatures, 0);

    // Create 3309 byte simulated ML-DSA-65 signature
    let mut sig_vec = [2u8; 3309];
    sig_vec[0] = 99;
    let sig_bytes = Bytes::from_slice(&env, &sig_vec);

    let msg = Bytes::from_slice(&env, b"Transfer 100 USDC to Agent #7");
    let ctx = Bytes::from_slice(&env, b"qstellar-testnet");

    let verified = client.verify_ml_dsa_65(&user, &pk_bytes, &msg, &sig_bytes, &ctx);
    assert_eq!(verified, true);
    assert_eq!(client.total_verified(), 1);
}

#[test]
fn test_pqc_invalid_lengths_rejection() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let contract_id = env.register_contract(None, PqcVerifierContract);
    let client = PqcVerifierContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    // Wrong public key length (e.g. 32 instead of 1952)
    let bad_pk = Bytes::from_slice(&env, &[1u8; 32]);
    let result = client.try_register_pqc_identity(&user, &bad_pk);
    assert!(result.is_err());
}
