# 🌐 QSTELLAR — Global Hackathon-Winning Blueprint

> **The Winning Formula**: Pick a sharp real-world problem → Make Stellar essential → Ship one complete, reliable demo flow → Explain it in 60 seconds.

---

## 1. The Core Thesis

> **"For AI agent operators and MCP server providers, QSTELLAR enables per-call USDC/QST micropayments with on-chain Soroban spending limits, so APIs can monetize autonomous agent traffic without subscriptions, invoices, or credit card fraud."**

### Answering the Four Critical Judge Questions:
1. **Who has the problem?**
   - API providers and MCP tool creators whose services are queried by autonomous AI agents, with no way to bill per inference call without requiring human credit card subscriptions.
   - Users who want AI agents to use paid tools but fear runaway billing and wallet draining.
2. **What costly/risky step happens today?**
   - Developers either leave APIs free (facing bot exhaustion) or lock them behind \$20–\$100/mo SaaS subscriptions that autonomous agents cannot purchase.
   - Giving an agent a raw private key risks immediate wallet draining upon prompt injection.
3. **What does Stellar enable that traditional APIs cannot?**
   - **Sub-cent transaction fees** (< \$0.00001) that make \$0.01–\$0.05 micropayments economically viable.
   - **Soroban authorization entries & allowances** that enforce cryptographic daily spend caps on-chain.
   - **Sub-5 second settlement finality** matching HTTP request-response timeouts.
4. **What can a judge actually do in the demo?**
   - Set a 1.00 QST budget → Prompt an AI agent → Watch the agent query Stellar Raven MCP → Trigger an x402 challenge → Enforce the policy limit → Settle atomically on Testnet → Inspect the remaining budget and receipt in under 60 seconds.

---

## 2. The 3 Competitive Lanes & QSTELLAR's Positioning

| Dimension | Lane 1: Agentic Payments (Primary) | Lane 2: Privacy / ZK Compliance | Lane 3: Financial Coordination |
| :--- | :--- | :--- | :--- |
| **Prior-Art Winners** | Cards402 (1st), CleverCon (2nd), RenderGate (3rd) | Wraith (1st), AnchorShield (2nd), Umbra (3rd) | Payment streams, freelancer escrows |
| **QSTELLAR Implementation** | **x402 Bazaar Protocol + Raven MCP + Policy Guard** | **Groth16 BN254 ZK-KYC Proofs + Poseidon2** | **Soroban Escrow + Task Completion Proofs** |
| **Differentiator** | Enforceable daily budgets + human approval gates | Zero-disclosure compliance tier attestation | Atomic multi-party fee splits |

---

## 3. The "Golden Path" Demo Sequence (Under 2 Minutes)

```
[1. Connect]         Judge connects Freighter or selects Testnet Dev Wallet.
         ↓
[2. Set Policy]      Judge sets Agent Daily Budget (e.g. 5.00 QST) & Per-Call Limit (0.10 QST).
         ↓
[3. Request Service] Agent calls protected endpoint (GET /api/ai/research) → Receives HTTP 402.
         ↓
[4. Policy Check]    Policy Guard checks: 0.05 QST <= 0.10 QST cap & within daily limit.
         ↓
[5. Authorize]       Wallet prompts user signature (Fail-Closed Safety Gate).
         ↓
[6. Settle On-Chain] Soroban settles payment to facilitator and provider on Stellar Testnet.
         ↓
[7. Deliver & Update]API unlocks premium payload; dashboard updates: Spend: 0.05 QST | Remaining: 4.95 QST.
```

---

## 4. "Proof of Realness" Stack for Judges

To eliminate skepticism, QSTELLAR demonstrates:
1. **Live Hosted Demo**: Built-in HTTP server (`npm run start:web`) running at `http://localhost:3000`.
2. **Public GitHub Repository**: Published and tracked at `https://github.com/elon00/qstellar`.
3. **Real Soroban Smart Contracts**: Rust contracts compiled to `wasm32v1-none` with 100% passing tests.
4. **Live Stellar Raven MCP**: Connected to official SDF endpoint `https://raven.stellar.org/mcp`.
5. **Real Testnet Settlement**: Valid transaction hashes emitted on Stellar Testnet ledger.
6. **NIST FIPS 204 ML-DSA-65**: Grounded in official **CAP-0087** parameter specifications (1952B PK, 3309B Sig).

---

## 5. 60-Second Elevator Pitch

> *"AI agents can discover tools, but they cannot safely pay for them per use. Traditional payment rails require credit cards and monthly subscriptions that machines cannot navigate.*
> 
> *QSTELLAR is a policy-controlled agent payment gateway on Stellar. When an agent calls an MCP tool, our API returns an HTTP 402 challenge. A Soroban smart contract enforces the user's spending limit, the wallet signs client-side, and Stellar settles the payment in four seconds for fractions of a cent.*
> 
> *Here is the live demo: the agent just paid 0.05 QST, the remaining budget dropped from 5.00 to 4.95 QST, and our on-chain receipt proves settlement on Testnet ledger."*
