/**
 * QSTELLAR CORE CONSTANTS & CONFIGURATION
 * Standards: CAP-0087, SEP-10, SEP-41, x402 Bazaar, Raven MCP
 */

export const STELLAR_NETWORKS = {
  TESTNET: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  PUBLIC: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    horizonUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://soroban.stellar.org',
  },
};

export const CONTRACT_DEFAULTS = {
  TOKEN_DECIMALS: 7,
  STROOPS_PER_UNIT: 10_000_000n, // 10^7
  DEFAULT_TOKEN_SYMBOL: 'QST',
  DEFAULT_TOKEN_NAME: 'Qstellar Token',
  // Official Testnet reference contracts
  USDC_TESTNET: 'CBIELTK6YBZJU5UP2WWQEUCYJLPU6QXNBDMX5P3GBV7N65WBS6H3XGVO',
  NATIVE_SAC: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
};

export const PQC_STANDARDS = {
  ALGORITHM: 'ML-DSA-65',
  NIST_STANDARD: 'NIST FIPS 204 (August 2024)',
  CAP_REFERENCE: 'CAP-0087 (Host functions for ML-DSA signature verification)',
  PUBLIC_KEY_BYTES: 1952,
  SIGNATURE_BYTES: 3309,
  MAX_CONTEXT_BYTES: 255,
  SECURITY_CATEGORY: 3, // AES-192 equivalent post-quantum security
};

export const RAVEN_CONFIG = {
  MCP_URL: 'https://raven.stellar.org/mcp',
  DEFAULT_TOOLS: [
    'search_stellar_docs',
    'query_ecosystem_projects',
    'get_soroban_contract_playbook',
    'lookup_sep_cap_standard',
    'simulate_tx_telemetry',
  ],
};

export const X402_CONFIG = {
  HEADER_PAYMENT_REQUIRED: 'x402-payment-required',
  HEADER_PAYMENT_AUTHORIZATION: 'x402-payment-authorization',
  HEADER_PAYMENT_RECEIPT: 'x402-payment-receipt',
  STATUS_CODE: 402,
  DEFAULT_FACILITATOR_FEE_BPS: 50, // 0.5%
};

/**
 * Format stroops (i128 / bigint / number) to decimal string
 */
export function stroopsToDecimal(stroops, decimals = 7) {
  const s = BigInt(stroops).toString();
  if (s.length <= decimals) {
    const padded = s.padStart(decimals, '0');
    return `0.${padded}`.replace(/0+$/, '').replace(/\.$/, '.0');
  }
  const intPart = s.slice(0, s.length - decimals);
  const fracPart = s.slice(s.length - decimals).replace(/0+$/, '');
  return fracPart ? `${intPart}.${fracPart}` : `${intPart}.0`;
}

/**
 * Parse human decimal string to bigint stroops
 */
export function decimalToStroops(decimalStr, decimals = 7) {
  const parts = String(decimalStr).trim().split('.');
  const intPart = parts[0] || '0';
  let fracPart = (parts[1] || '').slice(0, decimals);
  fracPart = fracPart.padEnd(decimals, '0');
  return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(fracPart);
}

/**
 * Shorten public key or contract address for display (e.g. GDFACI...9999)
 */
export function shortenAddress(addr, chars = 4) {
  if (!addr || typeof addr !== 'string') return '';
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}
