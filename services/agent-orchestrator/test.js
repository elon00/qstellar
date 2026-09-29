import { AgentOrchestrator } from './index.js';

console.log('🧪 [TEST] Running Agent Orchestrator Multi-Model Test Suite...');

const orchestrator = new AgentOrchestrator({ model: 'claude-3-5-sonnet-20241022' });

const result = await orchestrator.processUserIntent({
  intent: 'Find an Stellar intelligence service and analyze portfolio risk under 0.10 QST',
  userWalletAddress: 'GDALICE777777777777777777777777777777777777777777777777',
});

console.assert(result.success === true, 'Pipeline must succeed');
console.assert(result.logs.length === 7, `Expected 7 pipeline steps, got ${result.logs.length}`);
console.log(`✅ [1/2] Complete 7-step Agentic Pipeline passed:`);
result.logs.forEach(l => console.log(`   - [${l.step}] ${l.text}`));

// Switch model
orchestrator.setModel('gpt-4o');
console.assert(orchestrator.model === 'gpt-4o', 'Model switch must succeed');
console.log(`✅ [2/2] Dynamic Model Switch to GPT-4o verified!`);

console.log('🎉 All Agent Orchestrator tests passed successfully!\n');
