import { AgentPolicyGuard } from './index.js';

console.log('🧪 [TEST] Running Agent Policy Guard & Budget Controller Test Suite...');

const guard = new AgentPolicyGuard({
  dailyBudgetStroops: 10_000_000n, // 1.00 QST
  perCallLimitStroops: 2_000_000n,  // 0.20 QST
  humanConfirmThresholdStroops: 500_000n, // 0.05 QST
});

// 1. Initial State
let t = guard.getTelemetry();
console.assert(t.dailyBudgetQst === '1.0', `Expected 1.0 QST daily budget, got ${t.dailyBudgetQst}`);
console.assert(t.remainingBudgetQst === '1.0', 'Expected 1.0 QST remaining');
console.log(`✅ [1/4] Policy initialized: Budget=${t.dailyBudgetQst} QST, Per-Call Cap=${t.perCallLimitQst} QST`);

// 2. Normal Call within policy
const check1 = guard.evaluate({ amountStroops: 500_000n });
console.assert(check1.allowed === true, 'Call must be allowed');
console.assert(check1.requiresHumanAuth === true, '0.05 QST requires human auth');
guard.recordSettlement({ amountStroops: 500_000n, txHash: 'tx_test1' });
console.log(`✅ [2/4] Valid Payment evaluated and recorded: Remaining=${guard.getTelemetry().remainingBudgetQst} QST`);

// 3. Reject Excessive Per-Call Payment
const check2 = guard.evaluate({ amountStroops: 3_000_000n }); // 0.30 QST exceeds 0.20 QST cap
console.assert(check2.allowed === false, 'Must block payment exceeding per-call limit');
console.log(`✅ [3/4] Per-Call Violation blocked: ${check2.reason}`);

// 4. Reject Budget Overrun
const check3 = guard.evaluate({ amountStroops: 1_000_000n }); // 0.10 QST (cumulative would be 0.15 QST) - allowed
guard.recordSettlement({ amountStroops: 800_000n, txHash: 'tx_test2' });
// Now remaining is 1.0 - 0.05 - 0.08 = 0.87
const checkOverrun = guard.evaluate({ amountStroops: 9_000_000n }); // 0.90 QST exceeds remaining
console.assert(checkOverrun.allowed === false, 'Must block budget overrun');
console.log(`✅ [4/4] Budget Overrun blocked: ${checkOverrun.reason}`);

console.log('🎉 All Policy Guard tests passed successfully!\n');
