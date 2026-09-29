/**
 * QSTELLAR POLICY GUARD & AGENT BUDGET CONTROLLER
 * 
 * Enforces:
 * 1. Per-Call Spending Limits (e.g. max 0.10 QST per API request)
 * 2. Daily Cumulative Budgets (e.g. max 5.00 QST per 24 hours)
 * 3. Human Confirmation Thresholds (e.g. require Freighter popup if > 0.05 QST)
 * 4. Autonomous Micro-Settlement (auto-authorize if strictly within policy limits)
 */

import { stroopsToDecimal, decimalToStroops } from '../core/index.js';

export class AgentPolicyGuard {
  constructor(config = {}) {
    this.dailyBudgetStroops = config.dailyBudgetStroops || 50_000_000n; // 5.00 QST default
    this.perCallLimitStroops = config.perCallLimitStroops || 1_000_000n; // 0.10 QST default
    this.humanConfirmThresholdStroops = config.humanConfirmThresholdStroops || 500_000n; // 0.05 QST
    this.spentTodayStroops = 0n;
    this.approvedCalls = 0;
    this.blockedCalls = 0;
    this.receipts = [];
  }

  setDailyBudget(amountDecimal) {
    this.dailyBudgetStroops = decimalToStroops(amountDecimal);
  }

  setPerCallLimit(amountDecimal) {
    this.perCallLimitStroops = decimalToStroops(amountDecimal);
  }

  /**
   * Evaluate a requested agent micropayment against active policy
   * @param {Object} payment - { amountStroops, resourceId, destination }
   * @returns {Object} { allowed: boolean, requiresHumanAuth: boolean, reason: string }
   */
  evaluate(payment) {
    const amount = BigInt(payment.amountStroops || 0);

    // Rule 1: Per-Call Cap
    if (amount > this.perCallLimitStroops) {
      this.blockedCalls++;
      return {
        allowed: false,
        requiresHumanAuth: false,
        reason: `POLICY_BLOCKED: Amount (${stroopsToDecimal(amount)} QST) exceeds per-call limit of ${stroopsToDecimal(this.perCallLimitStroops)} QST`,
      };
    }

    // Rule 2: Daily Budget Exhaustion
    if (this.spentTodayStroops + amount > this.dailyBudgetStroops) {
      this.blockedCalls++;
      return {
        allowed: false,
        requiresHumanAuth: false,
        reason: `POLICY_BLOCKED: Daily budget exhausted (${stroopsToDecimal(this.spentTodayStroops)} / ${stroopsToDecimal(this.dailyBudgetStroops)} QST spent)`,
      };
    }

    // Rule 3: Human Escalation Check
    const requiresHumanAuth = amount >= this.humanConfirmThresholdStroops;

    return {
      allowed: true,
      requiresHumanAuth,
      reason: requiresHumanAuth
        ? 'POLICY_APPROVED: Requires explicit human wallet confirmation (above auto-approval threshold)'
        : 'POLICY_APPROVED: Automatically cleared within micro-allowance',
    };
  }

  /**
   * Record settled payment and update remaining balance
   */
  recordSettlement(receipt) {
    const amount = BigInt(receipt.amountStroops || decimalToStroops(receipt.amountPaid || '0'));
    this.spentTodayStroops += amount;
    this.approvedCalls++;
    this.receipts.push({
      ...receipt,
      recordedAt: new Date().toISOString(),
    });

    return this.getTelemetry();
  }

  getTelemetry() {
    const remainingStroops = this.dailyBudgetStroops > this.spentTodayStroops
      ? this.dailyBudgetStroops - this.spentTodayStroops
      : 0n;

    return {
      dailyBudgetQst: stroopsToDecimal(this.dailyBudgetStroops),
      perCallLimitQst: stroopsToDecimal(this.perCallLimitStroops),
      spentTodayQst: stroopsToDecimal(this.spentTodayStroops),
      remainingBudgetQst: stroopsToDecimal(remainingStroops),
      utilizationPercent: Number((this.spentTodayStroops * 100n) / (this.dailyBudgetStroops || 1n)),
      approvedCalls: this.approvedCalls,
      blockedCalls: this.blockedCalls,
    };
  }
}
