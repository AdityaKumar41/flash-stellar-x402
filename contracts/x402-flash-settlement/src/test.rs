#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, X402FlashContract);
    let client = X402FlashContract::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Initialize contract
    client.initialize(&admin);

    // Verify admin is set (would need a getter function to test properly)
    // For now, test that it doesn't panic
}

#[test]
fn test_open_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, X402FlashContract);
    let client = X402FlashContract::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let server = Address::generate(&env);
    let token = Address::generate(&env);

    // Initialize
    client.initialize(&admin);

    // Open escrow
    let result = client.open_escrow(&user, &server, &token, &1_000_000, &3600);
    assert!(result.is_ok());

    // Check escrow balance
    let balance = client.current_escrow(&user, &server);
    assert_eq!(balance, 1_000_000);
}

#[test]
fn test_close_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, X402FlashContract);
    let client = X402FlashContract::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let server = Address::generate(&env);
    let token = Address::generate(&env);

    // Initialize and open
    client.initialize(&admin);
    client.open_escrow(&user, &server, &token, &1_000_000, &3600).unwrap();

    // Close escrow
    let result = client.client_close_escrow(&user, &server);
    assert!(result.is_ok());

    // Balance should be 0
    let balance = client.current_escrow(&user, &server);
    assert_eq!(balance, 0);
}

// TODO: Add more comprehensive tests for settle_payment with signature verification
