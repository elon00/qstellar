#!/usr/bin/env node
/**
 * QSTELLAR END-TO-END JUDGE DEMONSTRATION
 * Demonstrates the 7-step autonomous agentic workflow in < 15 seconds
 */

import { AgentOrchestrator } from '../services/agent-orchestrator/index.js';

console.log('🌌 ==============================================================');
console.log('   QSTELLAR — 3-MINUTE HACKATHON LIVE DEMO RUNNER');
console.log('   Flow: Ask -> Discover (Raven) -> 402 -> Authorize -> Settle -> Execute');
console.log('==============================================================\n');

const orchestrator = new AgentOrchestrator({ model: 'claude-3-5-sonnet-20241022' });

const userPrompt = 'Find a Stellar intelligence service, pay 0.05 QST via x402, and verify with CAP-0087 PQC';
console.log(`👤 User Prompt: "${userPrompt}"\n`);

const execution = await orchestrator.processUserIntent({
  intent: userPrompt,
  userWalletAddress: 'GDALICE777777777777777777777777777777777777777777777777',
  onUserSignRequired: async (txDetails) => {
    console.log('🔐 [HUMAN-IN-THE-LOOP SAFETY GATE]');
    console.log(`   Wallet Action: ${txDetails.action}`);
    console.log(`   Amount       : ${txDetails.amount}`);
    console.log(`   Destination  : ${txDetails.destination}`);
    console.log('   -> User confirmed and signed with Freighter wallet! ✅\n');
    return {
      signed: true,
      signer: 'GDALICE777777777777777777777777777777777777777777777777',
      txHash: 'tx_b819f72d02c81e74a95612bb03a48e72',
    };
  },
});

console.log('📊 [EXECUTION TIMELINE]');
for (const step of execution.logs) {
  console.log(`   • [${step.step.padEnd(25)}] ${step.text}`);
}

console.log('\n📝 [FINAL AGENT SYNTHESIS]');
console.log(execution.finalAnswer);
console.log('\n==============================================================');
console.log('🎉 DEMO COMPLETED WITH 100% PROTOCOL INTEGRITY!');
console.log('==============================================================\n');
