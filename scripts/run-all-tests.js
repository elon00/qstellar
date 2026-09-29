#!/usr/bin/env node
/**
 * QSTELLAR UNIFIED TEST RUNNER
 * Verifies all modules: PQC Crypto, x402 Bazaar, Raven MCP, Conway Automaton, ZK Privacy, Orchestrator
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🌌 ==============================================================');
console.log('   QSTELLAR — UNIFIED TEST SUITE & VERIFICATION HARNESS');
console.log('   Standards: NIST FIPS 204, CAP-0087, SEP-41, x402, Raven MCP');
console.log('==============================================================\n');

const testSuites = [
  { name: 'PQC ML-DSA-65 Cryptography (NIST FIPS 204)', script: 'packages/pqc-crypto/test.js' },
  { name: 'x402 Bazaar Micropayments Protocol', script: 'packages/x402-bazaar/test.js' },
  { name: 'Stellar Raven Remote MCP Client', script: 'packages/raven-mcp/test.js' },
  { name: 'Conway Cellular Automaton Agent Engine', script: 'packages/conway-automaton/test.js' },
  { name: 'Zero-Knowledge Selective Privacy (Groth16/BN254)', script: 'packages/privacy-zk/test.js' },
  { name: 'Stellar Wallets Kit v2 Multi-Wallet Manager', script: 'packages/stellar-wallet/test.js' },
  { name: 'Agent Policy Guard & Spend Controller', script: 'packages/policy-guard/test.js' },
  { name: 'Multi-Model AI Agent Orchestrator', script: 'services/agent-orchestrator/test.js' },
];

let allPassed = true;

for (const suite of testSuites) {
  console.log(`▶ Running: ${suite.name}...`);
  const res = spawnSync('node', [suite.script], { cwd: rootDir, encoding: 'utf8' });
  if (res.status === 0) {
    console.log(res.stdout.trim());
    console.log(`✅ [PASS] ${suite.name}\n`);
  } else {
    console.error(`❌ [FAIL] ${suite.name}`);
    console.error(res.stderr || res.stdout);
    allPassed = false;
  }
}

console.log('▶ Verifying Soroban Rust Smart Contracts via Cargo...');
const cargoRes = spawnSync('cargo', ['test', '--manifest-path', 'contracts/Cargo.toml'], {
  cwd: rootDir,
  encoding: 'utf8',
});

if (cargoRes.status === 0) {
  console.log('✅ [PASS] Soroban Smart Contracts (Token, Payment, Registry, PQC Verifier) passed 100%!\n');
} else {
  console.error('❌ [FAIL] Soroban Cargo test failed:');
  console.error(cargoRes.stderr);
  allPassed = false;
}

console.log('==============================================================');
if (allPassed) {
  console.log('🎉 ALL QSTELLAR TEST SUITES PASSED CLEANLY! READY FOR HACKATHON!');
} else {
  console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
  process.exit(1);
}
console.log('==============================================================\n');
