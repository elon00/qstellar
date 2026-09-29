import { AgentCellularAutomaton, AGENT_STATES } from './index.js';

console.log('🧪 [TEST] Running Conway Automaton Agent Simulation Test Suite...');

const ca = new AgentCellularAutomaton(16, 16, 0.3);
const initialTelemetry = ca.getTelemetry();
console.assert(initialTelemetry.totalCells === 256, 'Grid size must be 256 cells');
console.log(`✅ [1/3] Grid Initialized: ${initialTelemetry.activeAgents} active agents, Liquidity: ${initialTelemetry.totalLiquidity} QST`);

// Step 5 generations
for (let i = 0; i < 5; i++) {
  ca.step();
}
const stepTelemetry = ca.getTelemetry();
console.assert(stepTelemetry.generation === 5, 'Must advance 5 generations');
console.log(`✅ [2/3] Stepped 5 Generations: Settled Transactions: ${stepTelemetry.settledTransactions}`);

// Inject payment pulse
ca.injectPaymentPulse(8, 8);
const pulseTelemetry = ca.getTelemetry();
console.assert(pulseTelemetry.breakdown.paying >= 1, 'Payment pulse must activate paying agents');
console.log(`✅ [3/3] Transaction Pulse injected: Paying agents: ${pulseTelemetry.breakdown.paying}`);

console.log('🎉 All Conway Automaton tests passed successfully!\n');
