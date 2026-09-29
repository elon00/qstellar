import {
  X402Challenge,
  createPaymentAuthorization,
  verifyPaymentAuthorization,
} from './index.js';

console.log('🧪 [TEST] Running x402 Bazaar Protocol Test Suite...');

// 1. Create Challenge
const challenge = new X402Challenge({
  resourceId: 'AI_PORTFOLIO_ANALYSIS',
  amountStroops: 10_000_000n, // 1.0 QST
  assetCode: 'QST',
  destinationAccount: 'GDDESTINATION777777777777777777777777777777777777777777',
  facilitatorAccount: 'GDFACILITATOR999999999999999999999999999999999999999999',
});

const json = challenge.toJSON();
console.assert(json.status === 402, 'Status should be 402');
console.assert(json.pricing.amount === '1.0', `Expected 1.0 QST, got ${json.pricing.amount}`);
console.log(`✅ [1/3] Challenge Generation passed: ${json.resourceId} = ${json.pricing.amount} ${json.pricing.asset}`);

// 2. Client Payment Authorization
const auth = createPaymentAuthorization({
  challenge,
  payerAccount: 'GDALICEPAYER1111111111111111111111111111111111111111111111',
  txHash: 'tx_e4a8b79c0f12d837492c10bfa9487c6d',
  pqcSignatureHex: 'a1b2c3d4...',
});

console.assert(typeof auth.header === 'string', 'Authorization token must be base64 string');
console.log(`✅ [2/3] Authorization Creation passed: txHash=${auth.payload.txHash}`);

// 3. Gateway Payment Verification & Receipt
const verification = await verifyPaymentAuthorization(auth.header, challenge);
console.assert(verification.verified === true, 'Verification must succeed');
console.assert(verification.receipt.status === 'SETTLED_ON_STELLAR_TESTNET', 'Status settled');
console.log(`✅ [3/3] Settlement Verification passed: receiptId=${verification.receipt.receiptId}`);

console.log('🎉 All x402 Bazaar Protocol tests passed successfully!\n');
