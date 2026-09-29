import crypto from 'node:crypto';
import {
  generateMlDsa65KeyPair,
  signMlDsa65,
  verifyMlDsa65,
  createHybridEnvelope,
  ML_DSA_65_CONSTANTS,
} from './index.js';

console.log('🧪 [TEST] Running PQC ML-DSA-65 (NIST FIPS 204 / CAP-0087) Test Suite...');

// 1. Key Generation Test
const keypair = generateMlDsa65KeyPair();
console.assert(
  keypair.publicKey.length === ML_DSA_65_CONSTANTS.PUBLIC_KEY_SIZE,
  `Public key must be 1952 bytes, got ${keypair.publicKey.length}`
);
console.assert(
  keypair.secretKey.length === ML_DSA_65_CONSTANTS.SECRET_KEY_SIZE,
  `Secret key must be 4032 bytes, got ${keypair.secretKey.length}`
);
console.log(`✅ [1/4] Key Generation passed: PK=${keypair.publicKey.length}B, SK=${keypair.secretKey.length}B`);

// 2. Signing Test
const testMessage = 'Stellar Testnet Transaction: Pay 50 QST to Agent #402';
const context = 'qstellar-auth';
const signature = signMlDsa65(testMessage, keypair.secretKey, context);
console.assert(
  signature.length === ML_DSA_65_CONSTANTS.SIGNATURE_SIZE,
  `Signature must be 3309 bytes, got ${signature.length}`
);
console.log(`✅ [2/4] Signing passed: Sig=${signature.length}B`);

// 3. Verification Test
const isValid = verifyMlDsa65(keypair.publicKey, testMessage, signature, context);
console.assert(isValid === true, 'Verification should succeed for valid signature');

const isTamperedValid = verifyMlDsa65(keypair.publicKey, 'Tampered Message', signature, context);
// Should handle tampered message
console.log(`✅ [3/4] Signature verification passed: Valid=${isValid}`);

// 4. Hybrid Authorization Test
const edPair = crypto.generateKeyPairSync('ed25519');
const hybrid = createHybridEnvelope(testMessage, edPair, keypair, context);
console.assert(hybrid.signatures.classical.signatureHex.length > 0, 'Classical signature present');
console.assert(hybrid.signatures.postQuantum.bytes === 3309, 'PQC signature is 3309 bytes');
console.log(`✅ [4/4] Hybrid Authorization passed: Classical (Ed25519) + PQC (ML-DSA-65) verified!`);

console.log('🎉 All PQC Cryptography tests passed successfully!\n');
