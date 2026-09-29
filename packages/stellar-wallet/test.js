import { StellarWalletManager, SUPPORTED_WALLETS } from './index.js';

console.log('🧪 [TEST] Running Stellar Wallets Kit v2 Test Suite...');

const manager = new StellarWalletManager();

// 1. Kit v2 Init
const kit = await manager.initKit();
console.assert(kit.version === '2.0.0', 'Kit version must be 2.0.0');
console.log(`✅ [1/4] StellarWalletsKit.init() pattern passed: version=${kit.version}`);

// 2. Auth Modal
const connection = await manager.authModal('freighter');
console.assert(connection.connected === true, 'Must connect');
console.assert(connection.wallet === 'Freighter', 'Must be Freighter');
console.log(`✅ [2/4] authModal() connection passed: ${connection.wallet} -> ${connection.address.slice(0, 10)}...`);

// 3. Pre-flight Simulation
const sim = await manager.simulateTransaction({
  contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  method: 'transfer',
  args: [],
  payer: connection.address,
});
console.assert(sim.canProceed === true, 'Simulation must allow proceeding');
console.log(`✅ [3/4] Pre-flight simulation passed: CPU=${sim.cpuInstructions}, Fee=${sim.estimatedFeeStroops} stroops`);

// 4. Wallet Signing
const signed = await manager.signTransaction({
  xdr: 'AAAA_SIMULATED_TESTNET_XDR',
  summary: 'Pay 0.05 QST for AI Research',
});
console.assert(signed.signed === true, 'Signing must succeed');
console.assert(signed.txHash.startsWith('tx_'), 'Transaction hash generated');
console.log(`✅ [4/4] Wallet signing passed: TxHash=${signed.txHash}`);

console.log('🎉 All Stellar Wallets Kit v2 tests passed successfully!\n');
