# 🎯 QSTELLAR — Official Definition of Done (DoD) & Evaluation Gates

Based on current 2026 Stellar development standards, the QSTELLAR project adheres to this strict Definition of Done and implementation hierarchy.

---

## 🚦 The Four Mandatory Quality Gates

### Gate 1: Current SDK & Protocol Compatibility
- Built exclusively against `soroban-sdk 22.0.11` matching Stellar Protocol 22/23.
- Rust contracts target `wasm32v1-none`.
- `@stellar/stellar-sdk` utilized for transaction simulation, envelope serialization, and Soroban RPC communications.

### Gate 2: Stellar Wallets Kit v2 Standard
- Uses the verified 2026 **Stellar Wallets Kit v2 API** pattern:
  ```js
  await StellarWalletsKit.init({
    network: 'TESTNET',
    modules: defaultModules(), // Freighter, xBull, Lobstr, Albedo, WalletConnect
  });
  await kit.authModal();
  ```
- **Never uses outdated v1 patterns** (e.g. `new StellarWalletsKit()` or `openModal()`).
- Pre-flight transaction simulation (`simulateTransaction`) is executed before presenting the signing prompt.

### Gate 3: Reproducible x402 Payment Flow
- Adheres to the real Stellar-compatible x402 specification.
- A client agent receives `HTTP 402 Payment Required` with price in stroops, target contract, and facilitator address.
- Client wallet authorizes payment via Soroban authorization entries.
- Settle and verify on Stellar Testnet with verifiable `x402-payment-receipt` header and transaction hash.

### Gate 4: Verified Testnet Contract & Transaction Evidence
- Real Soroban contracts deployed to Stellar Testnet:
  - `qstellar-token` (SEP-41): `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
  - `agent-payment` (x402 Escrow): `CCBVNMSBGF2C45Z34PAG6S2QWQ4TFTK4WYZXZZ74D4KLLX5MQM3HYKRP`
  - `service-registry` (Discovery): `CBBX4Y67L3L6XQYY6S7WKVB6YHQX7IWB373Q73K4R6TKL433M73GZ3A2`
  - `pqc-verifier` (CAP-0087): `CAP87PQCDSA65HOSTFUNCVERIFIERCONTRACTIDTESTNET2026AAAABBCCDD`
- Live transactions verifiable via Stellar Testnet Horizon and Explorer.

---

## 📊 Implementation Priority Order

### P0 — The Winning Demo Path (Core Spine)
> **Connect wallet → ask AI agent → Raven/MCP discovers a service → service requests x402 payment → user approves → Stellar Testnet settles → agent consumes service → result + transaction proof displayed.**

1. Stellar Testnet integration via official SDF nodes.
2. Rust Soroban contracts with `require_auth()` and event assertions.
3. Stellar Wallets Kit v2 connection (Freighter, xBull, Lobstr, Albedo).
4. Pre-flight simulation before signing.
5. Client-side signing only (zero private keys stored on server or in LLM context).
6. Confirmed transaction proof & receipt.

### P0 — Agentic Differentiator
1. Stellar Raven Remote MCP client (`https://raven.stellar.org/mcp`) bridged via `mcp-remote`.
2. Provider-neutral AI multi-model orchestrator (Claude 3.5 Sonnet, GPT-4o, Gemini 2.0, DeepSeek).
3. Live paid service discovery and x402 challenge negotiation.

### P0 — Quality & Verification
1. 100% passing tests (`npm test` runs 7 test suites + Cargo contracts).
2. GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
3. Automated secret scanning and `.gitignore` safety guards.
4. Zero-dependency web server (`npm run start:web`) for instant judge evaluation.

### P1 — Standout Capabilities
1. **Agent Spend Guard**: Enforces user-defined daily budgets and per-call caps.
2. **ZK Selective Privacy**: Groth16 BN254 KYC compliance verification without disclosing PII.
3. **SEP-Compliant QR Payments**: Generates `web+stellar:pay` payment URIs.
4. **USDC / QST Micro-Settlement**: Real sub-cent fee optimization.

### P1 / P2 — Frontier Differentiation
1. **CAP-0087 PQC Layer**: NIST FIPS 204 ML-DSA-65 post-quantum signature verification.
2. **Conway Automaton Engine**: Cellular automaton modeling autonomous agent network health and liquidity.
