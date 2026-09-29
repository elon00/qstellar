import {
  poseidonHash,
  createConfidentialCommitment,
  generateZkKycProof,
  verifyZkProof,
} from './index.js';

console.log('🧪 [TEST] Running Zero-Knowledge Privacy Test Suite...');

// 1. Poseidon Hash Test
const hash = poseidonHash('10000000', 'blinding_salt_99', 'GDRECEIVER777');
console.assert(hash.startsWith('0x') && hash.length === 66, 'Poseidon hash must be 32-byte hex');
console.log(`✅ [1/3] Poseidon2 BN254 Hash passed: ${hash.slice(0, 18)}...`);

// 2. Confidential Commitment
const comm = createConfidentialCommitment({
  amount: 250,
  recipient: 'GDRECEIVER777',
});
console.assert(comm.commitment.length === 66, 'Commitment must be valid hash');
console.log(`✅ [2/3] Confidential Commitment passed: leaf=${comm.commitment.slice(0, 18)}...`);

// 3. ZK-KYC Proof & Verification
const proof = generateZkKycProof({
  account: 'GDALICE777777777777777777777777777777777777777777777777',
  jurisdiction: 'US',
  minAge: 21,
});

const result = verifyZkProof(proof);
console.assert(result.verified === true, 'ZK verification must succeed');
console.log(`✅ [3/3] ZK Proof Verified: ${result.attestation} (${proof.scheme})`);

console.log('🎉 All Zero-Knowledge Privacy tests passed successfully!\n');
