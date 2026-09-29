# ⚠️ QSTELLAR — What To Do and What NOT To Do

A strategic guideline based on reviews of 100+ Stellar hackathon submissions.

---

## ✅ What To Do (Best Practices Implemented in QSTELLAR)

1. **Tell a Coherent Product Story**:
   - Don't just list buzzwords. We frame QSTELLAR around a single, compelling journey: **Ask → Discover → Verify → Authorize → Pay → Settle → Execute**.
2. **Use Official Stellar Infrastructure**:
   - Integrate SDF's remote **Stellar Raven MCP** (`raven.stellar.org/mcp`) for AI tool execution.
   - Use standard **Soroban Rust smart contracts** targeting `wasm32v1-none`.
   - Use official **Stellar Wallets Kit** / Freighter for multi-wallet connectivity.
3. **Enforce Human-in-the-Loop Key Safety**:
   - Maintain a strict boundary: AI agents formulate transactions; only human users authorize and sign with client wallets.
4. **Implement Real x402 Protocol**:
   - Adhere to the actual Stellar-compatible x402 specification using Soroban authorization entries and facilitator settlement.
5. **Accurately Represent Cryptography**:
   - Ground post-quantum features in actual NIST standards (**FIPS 204 ML-DSA-65**) and Stellar Protocol **CAP-0087** parameters (1952B PK, 3309B Sig), rather than hand-wavy claims.
6. **Provide 100% Passing Automated Tests**:
   - Include unit tests, authorization checks, and event assertions for both smart contracts and off-chain packages.
7. **Ensure Frictionless Judge Evaluation**:
   - Provide a zero-dependency web console (`npm run start:web`) and a fast automated CLI demo (`npm run demo:agent`) that runs in seconds.

---

## ❌ What NOT To Do (Pitfalls Avoided)

1. **DO NOT Clone `stellar-protocol` and Claim It as Your Project**:
   - `stellar/stellar-protocol` is SDF's standards repository for SEPs and CAPs. Keep it as a reference, but build your application in a dedicated repository.
2. **DO NOT Put Private Keys or Seed Phrases in Code or Frontend**:
   - Never commit `.env` or write private seeds in client-side code. All signing must occur via the wallet extension.
3. **DO NOT Claim Mainnet Deployment When Only Testnet Exists**:
   - Be transparent: QSTELLAR is built and verified on Stellar Testnet. Mainnet deployment should only happen after formal security audits.
4. **DO NOT Claim Confidential Tokens are Production-Ready**:
   - Stellar officially labels Confidential Tokens as a developer preview and unaudited. Treat privacy features as experimental prototypes.
5. **DO NOT Call a Token "Mathematically Infinite"**:
   - A real token must implement clear issuance policies, role-based controls, or admin minting caps.
6. **DO NOT Allow LLMs to Autonomously Sign Financial Transactions**:
   - Autonomous signing exposes users to prompt injection and drainer attacks. Always require human confirmation.
7. **DO NOT Add Conway or Web4 as Meaningless Buzzwords**:
   - In QSTELLAR, the Conway automaton engine is directly wired to agent states (`IDLE`, `ACTIVE`, `PAYING`, `VERIFYING`) and models decentralized network liquidity.
