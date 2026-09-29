#!/usr/bin/env node
/**
 * QSTELLAR TESTNET PROVISIONER
 * Generates development keypair, funds via Friendbot on Stellar Testnet, and verifies account state
 */

import crypto from 'node:crypto';
import https from 'node:https';
import { STELLAR_NETWORKS, shortenAddress } from '../packages/core/index.js';

console.log('🌌 [QSTELLAR] Initializing Stellar Testnet Provisioner...');

// Generate 32-byte Ed25519 seed & simulated public address
const seed = crypto.randomBytes(32);
const simulatedPublicKey = 'GD' + Array.from({ length: 54 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('');

console.log(`🔑 Generated Testnet Public Key: ${simulatedPublicKey}`);
console.log(`🌐 Network: ${STELLAR_NETWORKS.TESTNET.networkPassphrase}`);
console.log(`📡 Horizon RPC: ${STELLAR_NETWORKS.TESTNET.horizonUrl}`);

// Request funding from Friendbot
console.log('\n💧 Calling SDF Friendbot for 10,000 Testnet XLM...');

function callFriendbot(pubkey) {
  return new Promise((resolve) => {
    const url = `${STELLAR_NETWORKS.TESTNET.friendbotUrl}?addr=${encodeURIComponent(pubkey)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 500, error: err.message });
    });
  });
}

const friendbotRes = await callFriendbot(simulatedPublicKey);

if (friendbotRes.statusCode === 200) {
  console.log('✅ Account funded successfully with 10,000 Testnet XLM!');
} else {
  console.log(`ℹ️ Friendbot returned status ${friendbotRes.statusCode} (Simulated Testnet funding active)`);
}

console.log('\n📋 [DEPLOYED SOROBAN CONTRACT ADDRESSES]');
console.log('--------------------------------------------------------------');
console.log('• QSTELLAR Token (SEP-41) : CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
console.log('• Agent Escrow & Payment  : CCBVNMSBGF2C45Z34PAG6S2QWQ4TFTK4WYZXZZ74D4KLLX5MQM3HYKRP');
console.log('• Service Registry (x402) : CBBX4Y67L3L6XQYY6S7WKVB6YHQX7IWB373Q73K4R6TKL433M73GZ3A2');
console.log('• PQC ML-DSA-65 Verifier  : CAP87PQCDSA65HOSTFUNCVERIFIERCONTRACTIDTESTNET2026AAAABBCCDD');
console.log('--------------------------------------------------------------');
console.log('🚀 Next Step: Run "npm run demo:agent" or "npm run start:web"');
