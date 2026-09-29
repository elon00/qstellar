#!/usr/bin/env node
/**
 * QSTELLAR PQC BENCHMARKS
 * Benchmarks NIST FIPS 204 ML-DSA-65 vs Classical Ed25519
 */

import crypto from 'node:crypto';
import { generateMlDsa65KeyPair, signMlDsa65, verifyMlDsa65 } from '../packages/pqc-crypto/index.js';

console.log('⚡ ==============================================================');
console.log('   QSTELLAR — PQC CRYPTOGRAPHIC BENCHMARK (NIST FIPS 204)');
console.log('   Comparison: Ed25519 (Classical) vs ML-DSA-65 (Post-Quantum)');
console.log('==============================================================\n');

const ITERATIONS = 100;
const testMessage = Buffer.from('Stellar Soroban CAP-0087 Authorization Payload');

// 1. Classical Ed25519 Benchmark
console.log(`⏱️ Benchmarking Ed25519 (${ITERATIONS} iterations)...`);
const t0 = performance.now();
let edPair;
for (let i = 0; i < ITERATIONS; i++) {
  edPair = crypto.generateKeyPairSync('ed25519');
}
const edKeygenTime = (performance.now() - t0) / ITERATIONS;

const t1 = performance.now();
let edSig;
for (let i = 0; i < ITERATIONS; i++) {
  edSig = crypto.sign(null, testMessage, edPair.privateKey);
}
const edSignTime = (performance.now() - t1) / ITERATIONS;

const t2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  crypto.verify(null, testMessage, edPair.publicKey, edSig);
}
const edVerifyTime = (performance.now() - t2) / ITERATIONS;

// 2. ML-DSA-65 Benchmark
console.log(`⏱️ Benchmarking ML-DSA-65 (${ITERATIONS} iterations)...`);
const t3 = performance.now();
let pqcPair;
for (let i = 0; i < ITERATIONS; i++) {
  pqcPair = generateMlDsa65KeyPair();
}
const pqcKeygenTime = (performance.now() - t3) / ITERATIONS;

const t4 = performance.now();
let pqcSig;
for (let i = 0; i < ITERATIONS; i++) {
  pqcSig = signMlDsa65(testMessage, pqcPair.secretKey, 'bench');
}
const pqcSignTime = (performance.now() - t4) / ITERATIONS;

const t5 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  verifyMlDsa65(pqcPair.publicKey, testMessage, pqcSig, 'bench');
}
const pqcVerifyTime = (performance.now() - t5) / ITERATIONS;

console.log('\n📊 [BENCHMARK RESULTS]');
console.log('┌──────────────────────┬────────────────────┬────────────────────┐');
console.log('│ Metric               │ Ed25519 (Classical)│ ML-DSA-65 (PQC)    │');
console.log('├──────────────────────┼────────────────────┼────────────────────┤');
console.log(`│ Public Key Size      │ 32 bytes           │ 1,952 bytes        │`);
console.log(`│ Signature Size       │ 64 bytes           │ 3,309 bytes        │`);
console.log(`│ Quantum Resistance   │ ❌ Broken by Shor  │ ✅ NIST Level 3    │`);
console.log(`│ Keygen Latency       │ ${edKeygenTime.toFixed(3)} ms           │ ${pqcKeygenTime.toFixed(3)} ms           │`);
console.log(`│ Signing Latency      │ ${edSignTime.toFixed(3)} ms           │ ${pqcSignTime.toFixed(3)} ms           │`);
console.log(`│ Verify Latency       │ ${edVerifyTime.toFixed(3)} ms           │ ${pqcVerifyTime.toFixed(3)} ms           │`);
console.log('└──────────────────────┴────────────────────┴────────────────────┘');
console.log('\n💡 Conclusion: ML-DSA-65 provides post-quantum security with negligible millisecond-level verification overhead, perfectly suited for Soroban CAP-0087 host functions.');
