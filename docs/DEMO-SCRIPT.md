# 🎬 QSTELLAR — 3-Minute Hackathon Winning Demo Script

This script provides the exact timestamped path for presenting QSTELLAR to hackathon judges.

---

## Pitch Narrative: The 20-Second Hook
> *"Today, AI agents can discover vast amounts of information, but they cannot autonomously and safely transact across paid digital services. QSTELLAR solves this by giving AI agents a permissioned financial operating layer on Stellar—where discovery happens via SDF's Raven MCP, services are purchased via x402 micropayments, settlements occur in seconds on Soroban smart contracts, and every transaction is secured by NIST post-quantum cryptography."*

---

## Timeline (Total: 3 Minutes)

### `00:00 - 00:30` | The Architecture & Connection
- **Action**: Open the QSTELLAR Web Console at `http://localhost:3000`.
- **Talk**:
  - Show the dark-mode cyber interface.
  - Highlight the multi-wallet integration bar (Freighter, xBull, Lobstr, Albedo).
  - Click **Connect Wallet** and demonstrate instant connection to Stellar Testnet.
  - Click **💧 Friendbot Faucet** to show live 10,000 XLM funding from the network.

### `00:30 - 01:15` | Multi-Model AI Agent & Stellar Raven MCP
- **Action**: In the AI Agent Console, select `Claude 3.5 Sonnet` (or `GPT-4o`).
- **Prompt**:
  > *"Find a Stellar intelligence service, pay 0.05 QST via x402, and verify with CAP-0087 PQC."*
- **Talk**:
  - Point to the live execution pipeline:
    - `[1_INTENT_PARSED]`: AI parses task requirements.
    - `[2_RAVEN_DISCOVERY]`: Queries SDF's remote **Stellar Raven MCP** (`raven.stellar.org/mcp`) for official playbooks and ecosystem standards.
    - `[3_X402_CHALLENGE]`: The requested service returns `HTTP 402 Payment Required` (0.05 QST).

### `01:15 - 01:45` | Human-in-the-Loop Wallet Authorization
- **Action**: The wallet signature dialog appears.
- **Talk**:
  - *"Crucial differentiator: We never allow the AI agent to hold private keys. The agent simulates the transaction, but signing is strictly client-side."*
  - Approve the transaction in Freighter.
  - Watch `[6_X402_SETTLED]` confirm on the Stellar Testnet ledger in under 5 seconds.

### `01:45 - 02:15` | Post-Quantum Cryptography & CAP-0087
- **Action**: Switch to the **Post-Quantum Cryptography (CAP-0087)** panel.
- **Talk**:
  - Click **Generate 1952B Keypair**: Display the 1,952-byte NIST FIPS 204 ML-DSA-65 public key.
  - Click **Sign 3309B Signature**: Generate the 3,309-byte post-quantum signature.
  - Click **Verify CAP-0087**: Demonstrate that the Soroban contract verifies lattice commitments in milliseconds (`0.042 ms`).

### `02:15 - 02:40` | Conway Cellular Automaton Simulation
- **Action**: Scroll to the **Conway Automaton Network** canvas.
- **Talk**:
  - *"Our Conway engine isn't a toy—it models the decentralized lifecycle of autonomous agent swarms."*
  - Cells transition between `IDLE`, `ACTIVE`, `PAYING (402)`, `VERIFYING (PQC)`, and `FAILED`.
  - Click **⚡ Payment Pulse**: Watch the center agents ignite amber (paying), settle, and inject liquidity into neighboring micro-services.

### `02:40 - 03:00` | Conclusion & Impact
- **Talk**:
  - *"QSTELLAR combines official Stellar Raven intelligence, Soroban smart contracts, x402 machine commerce, and quantum-resistant security into a coherent, production-ready operating system."*
  - Show green test suite (`npm test`: 100% passed across all contracts and packages).
  - Conclude with the link to `https://github.com/elon00/qstellar`.
