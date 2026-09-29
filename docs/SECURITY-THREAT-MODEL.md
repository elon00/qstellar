# 🛡️ QSTELLAR — Security Architecture & Threat Model

## 1. Core Security Principle: Fail-Closed Key Separation

The central security tenet of QSTELLAR is **strict cryptographic segregation between AI agent intelligence and transaction signing authority**:

```
+------------------------------------+       +------------------------------------+
|         AI AGENT COGNITION         |       |      USER CRYPTOGRAPHIC VAULT      |
|  - Reads public balances & states  |       |  - Holds private seed (Freighter)  |
|  - Queries Stellar Raven MCP       |  =/=> |  - Evaluates explicit intent       |
|  - Simulates transaction gas       |       |  - Approves & signs client-side    |
|  - Formulates x402 payloads        |       |  - Submits signed XDR to network   |
+------------------------------------+       +------------------------------------+
```

### Inviolable Invariants:
1. **No LLM or Agent Ever Holds Private Keys**: Private keys never enter LLM prompts, agent memory, server logs, or environment variables.
2. **All Financial Mutations Require Human Confirmation**: The agent orchestrator stops at step 4 (`4_AWAITING_USER_SIGNATURE`) and renders an explicit confirmation modal in the user's wallet.
3. **Simulation Before Execution**: Every Soroban invocation is simulated to prevent unexpected state traps or gas exhaustion.

---

## 2. Threat Vector Analysis & Mitigations

### Threat 1: Prompt Injection / Social Engineering
- **Attack Vector**: An attacker attempts to trick an LLM agent into spending excess funds or transferring balances to an unauthorized address.
- **Mitigation**:
  - The agent's output is purely a proposal payload.
  - The wallet interface displays the exact asset, destination address, and amount in stroops.
  - Any transaction differing from user expectations is rejected at the wallet gate.

### Threat 2: x402 Replay Attacks & Challenge Tampering
- **Attack Vector**: An attacker intercepts a signed authorization entry or re-submits an expired challenge.
- **Mitigation**:
  - Each `X402Challenge` incorporates a cryptographically unique `challengeId` and a strict 300-second TTL (`expiresAt`).
  - Active challenges are tracked in an in-memory hash map and immediately invalidated upon settlement.
  - Testnet transaction hashes are verified against the ledger before unlocking protected endpoints.

### Threat 3: Quantum Cryptanalysis (Shor's Algorithm)
- **Attack Vector**: A future quantum adversary uses Shor's algorithm to compute the discrete logarithm / elliptic curve private key from an on-chain public key.
- **Mitigation**:
  - QSTELLAR implements **CAP-0087 / NIST FIPS 204 ML-DSA-65**.
  - Transactions use hybrid authorization: classical Ed25519 (for immediate network compatibility) combined with an ML-DSA-65 signature (for long-term quantum resistance).
  - Even if classical cryptography is compromised in the future, the ML-DSA-65 signature preserves integrity.

### Threat 4: Unauthorized Token Minting / Supply Inflation
- **Attack Vector**: An unauthorized account invokes the `mint()` function on the Soroban token.
- **Mitigation**:
  - The `qstellar-token` contract enforces `admin.require_auth()`.
  - Attempts by non-admin callers immediately trap with `Error::Unauthorized`.

---

## 3. Pre-Mainnet Audit Checklist
Before graduating from Testnet to Mainnet:
- [ ] Formal verification with Runtime Verification or Certora.
- [ ] Fuzz testing via `cargo-fuzz` and property tests with `arbitrary`.
- [ ] Storage TTL auditing to ensure contracts bump TTL to prevent state expiration.
- [ ] Third-party penetration testing of the x402 API gateway.
