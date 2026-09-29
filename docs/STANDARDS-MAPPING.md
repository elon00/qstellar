# 📜 QSTELLAR — Standards & Ecosystem Proposals (SEP/CAP) Mapping

QSTELLAR strictly implements and builds upon active and proposed standards defined in the `stellar/stellar-protocol` repository.

---

## 1. CAP-0087: Host Functions for ML-DSA Signature Verification

- **Status**: Draft / Awaiting Protocol 23 Decision
- **Source**: `stellar-protocol/core/cap-0087.md`
- **Standard**: NIST FIPS 204 (Module-Lattice-Based Digital Signature Standard, August 2024)
- **QSTELLAR Implementation**:
  - Implemented in `@qstellar/pqc-crypto` and `contracts/pqc-verifier/`.
  - Supports **ML-DSA-65** parameter set:
    - **Public Key**: Exactly 1,952 bytes.
    - **Signature**: Exactly 3,309 bytes.
    - **Context**: 0 to 255 bytes domain separation string.
    - **Security Category**: Level 3 (equivalent to AES-192 against Shor's algorithm).
  - Emulates host function semantics with strict length checking, polynomial commitment validation, and hybrid classical/PQC envelopes.

---

## 2. SEP-0041: Token Interface for Soroban Smart Contracts

- **Status**: Active Ecosystem Standard
- **Source**: `stellar-protocol/ecosystem/sep-0041.md`
- **QSTELLAR Implementation**:
  - Implemented in `contracts/qstellar-token/`.
  - Implements the complete interface:
    - `initialize(admin: Address, decimals: u32, name: String, symbol: String)`
    - `mint(to: Address, amount: i128)`
    - `burn(from: Address, amount: i128)`
    - `transfer(from: Address, to: Address, amount: i128)`
    - `approve(from: Address, spender: Address, amount: i128, live_until_ledger: u32)`
    - `transfer_from(spender: Address, from: Address, to: Address, amount: i128)`
    - `balance(id: Address) -> i128`
    - `allowance(from: Address, spender: Address) -> i128`
    - `decimals() -> u32`
    - `name() -> String`
    - `symbol() -> String`
  - Emits standardized events: `symbol_short!("mint")`, `symbol_short!("transfer")`, `symbol_short!("approve")`.

---

## 3. x402: Bazaar Agentic Micropayments Protocol

- **Status**: Emerging Standard for AI Agent Commerce
- **Reference**: Stellar Developer Documentation (`developers.stellar.org/docs/build/agentic-payments/x402`)
- **QSTELLAR Implementation**:
  - Implemented in `@qstellar/x402-bazaar` and `services/api-gateway/`.
  - Replaces traditional subscription billing with granular per-request payments:
    - Standard HTTP status code `402 Payment Required`.
    - Returns base64-encoded `x402-payment-required` header containing pricing in stroops, target contract, and facilitator address.
    - Client wallet signs Soroban authorization entry.
    - Facilitator relays atomic settlement on Stellar Testnet in < 5 seconds.
    - Gateway releases protected resource with `x402-payment-receipt`.

---

## 4. Stellar Raven Remote MCP Server

- **Status**: Production Developer Tooling by SDF
- **Endpoint**: `https://raven.stellar.org/mcp`
- **QSTELLAR Implementation**:
  - Implemented in `@qstellar/raven-mcp` and bridged via `mcp-remote`.
  - Direct integration into AI agent loop for real-time retrieval of official documentation, ecosystem audit statuses, and contract playbooks without exposing API credentials to untrusted LLM contexts.

---

## 5. SEP-0010: Stellar Web Authentication

- **Status**: Standard
- **Source**: `stellar-protocol/ecosystem/sep-0010.md`
- **QSTELLAR Implementation**:
  - Cryptographic challenge-response authentication for multi-wallet sessions (Freighter, xBull, Lobstr, Albedo) via time-bounded challenge transactions signed client-side.
