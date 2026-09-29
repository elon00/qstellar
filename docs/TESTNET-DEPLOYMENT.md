# 🚀 QSTELLAR — Stellar Testnet Deployment Guide

This guide details how to build, test, and deploy the QSTELLAR Soroban smart contracts to the **Stellar Testnet**.

---

## 1. Prerequisites

Ensure your environment has the required toolchains:
```bash
# Verify Rust and Cargo
rustc --version    # 1.80+ or 1.98+
cargo --version

# Add the WASM compilation target
rustup target add wasm32v1-none wasm32-unknown-unknown

# Verify Node.js
node -v            # v22.0.0+ or v24.0.0+
npm -v
```

---

## 2. Automated One-Click Provisioning

Run the built-in provisioning script to generate a keypair and fund it via Friendbot:
```bash
npm run testnet:setup
```
Output:
```
🔑 Generated Testnet Public Key: GDALICE...
🌐 Network: Test SDF Network ; September 2015
📡 Horizon RPC: https://horizon-testnet.stellar.org
💧 Calling SDF Friendbot for 10,000 Testnet XLM...
✅ Account funded successfully with 10,000 Testnet XLM!
```

---

## 3. Compile Soroban Smart Contracts to WASM

Compile all four contracts using the optimized release profile:
```bash
# Build contracts
cargo build --release --manifest-path contracts/Cargo.toml --target wasm32v1-none

# Or using the npm script
npm run contracts:build
```

The resulting optimized `.wasm` artifacts will be generated in:
- `contracts/target/wasm32v1-none/release/qstellar_token.wasm`
- `contracts/target/wasm32v1-none/release/agent_payment.wasm`
- `contracts/target/wasm32v1-none/release/service_registry.wasm`
- `contracts/target/wasm32v1-none/release/pqc_verifier.wasm`

---

## 4. Deploying via Stellar CLI

If you have `stellar-cli` installed:

### Step 4.1: Deploy QSTELLAR Token (SEP-41)
```bash
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/qstellar_token.wasm \
  --source-account alice \
  --network testnet \
  --alias qstellar-token
```
*Note the returned Contract ID beginning with `C...`.*

### Step 4.2: Initialize Token Contract
```bash
stellar contract invoke \
  --id <TOKEN_CONTRACT_ID> \
  --source-account alice \
  --network testnet \
  -- initialize \
  --admin <ALICE_PUBLIC_KEY> \
  --decimals 7 \
  --name "Qstellar Token" \
  --symbol "QST"
```

### Step 4.3: Deploy Agent Payment & x402 Escrow Contract
```bash
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/agent_payment.wasm \
  --source-account alice \
  --network testnet \
  --alias agent-payment
```

### Step 4.4: Deploy Service Registry Contract
```bash
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/service_registry.wasm \
  --source-account alice \
  --network testnet \
  --alias service-registry
```

### Step 4.5: Deploy CAP-0087 PQC Verifier Contract
```bash
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/pqc_verifier.wasm \
  --source-account alice \
  --network testnet \
  --alias pqc-verifier
```

---

## 5. Verify Contract Invocations

Mint tokens to a designated agent address:
```bash
stellar contract invoke \
  --id <TOKEN_CONTRACT_ID> \
  --source-account alice \
  --network testnet \
  -- mint \
  --to <AGENT_PUBLIC_KEY> \
  --amount 10000000000
```

Verify balance:
```bash
stellar contract invoke \
  --id <TOKEN_CONTRACT_ID> \
  --source-account alice \
  --network testnet \
  -- balance \
  --id <AGENT_PUBLIC_KEY>
```

---

## 6. Run End-to-End Testnet Verification

```bash
npm run demo:agent
```
This runs the full 7-step autonomous agentic workflow demonstrating live Stellar Testnet settlement, Raven MCP integration, and CAP-0087 post-quantum signature verification.
