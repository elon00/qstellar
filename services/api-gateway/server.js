/**
 * QSTELLAR API GATEWAY & x402 FACILITATOR
 * Zero-dependency native HTTP server supporting x402 Bazaar Protocol, Raven MCP, PQC & Conway
 */

import http from 'node:http';
import { URL } from 'node:url';
import { STELLAR_NETWORKS, CONTRACT_DEFAULTS, X402_CONFIG, PQC_STANDARDS } from '../../packages/core/index.js';
import { X402Challenge, verifyPaymentAuthorization } from '../../packages/x402-bazaar/index.js';
import { StellarRavenClient } from '../../packages/raven-mcp/index.js';
import { generateMlDsa65KeyPair, signMlDsa65, verifyMlDsa65 } from '../../packages/pqc-crypto/index.js';
import { AgentCellularAutomaton } from '../../packages/conway-automaton/index.js';
import { generateZkKycProof, verifyZkProof, poseidonHash } from '../../packages/privacy-zk/index.js';

const PORT = process.env.PORT || process.env.X402_GATEWAY_PORT || 4020;
const raven = new StellarRavenClient();
const automaton = new AgentCellularAutomaton(24, 24, 0.28);

// Active x402 challenges store
const challenges = new Map();

// Helper for CORS & JSON responses
function sendJson(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x402-payment-authorization, x402-challenge-id',
    ...extraHeaders,
  });
  res.end(JSON.stringify(data, null, 2));
}

// Request body reader
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x402-payment-authorization, x402-challenge-id',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Health / System Status
    if (pathname === '/api/status' && req.method === 'GET') {
      const telemetry = automaton.getTelemetry();
      return sendJson(res, 200, {
        project: 'QSTELLAR: Privacy-Aware Post-Quantum Agentic Finance OS',
        version: '1.0.0',
        network: STELLAR_NETWORKS.TESTNET,
        standards: {
          pqc: PQC_STANDARDS,
          x402: 'x402-bazaar-v1',
          contracts: 'Soroban Protocol 22/23 (SEP-41, Escrow, Registry)',
          ravenMcp: 'https://raven.stellar.org/mcp',
        },
        conwayTelemetry: telemetry,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. List Registered Services
    if (pathname === '/api/services' && req.method === 'GET') {
      return sendJson(res, 200, {
        services: [
          {
            id: 'AI_DEEP_RESEARCH',
            endpoint: '/api/ai/research',
            priceQst: '0.05',
            stroops: '500000',
            description: 'Multi-source agentic research utilizing Stellar Raven MCP intelligence',
            category: 'AI_AGENTICS',
          },
          {
            id: 'MARKET_INTELLIGENCE',
            endpoint: '/api/market/intelligence',
            priceQst: '0.10',
            stroops: '1000000',
            description: 'Real-time Stellar DEX, liquidity pools, and Soroban volume analysis',
            category: 'FINANCIAL_ANALYTICS',
          },
          {
            id: 'PQC_SIGNATURE_VERIFIER',
            endpoint: '/api/pqc/verify',
            priceQst: '0.02',
            stroops: '200000',
            description: 'CAP-0087 NIST FIPS 204 ML-DSA-65 post-quantum verification node',
            category: 'SECURITY',
          },
          {
            id: 'ZK_SELECTIVE_PRIVACY',
            endpoint: '/api/privacy/prove',
            priceQst: '0.05',
            stroops: '500000',
            description: 'Groth16 BN254 zero-knowledge proof verification & attestation',
            category: 'PRIVACY',
          },
        ],
      });
    }

    // 3. Stellar Raven MCP Proxy Query
    if (pathname === '/api/raven/query' && req.method === 'GET') {
      const q = parsedUrl.searchParams.get('q') || 'soroban';
      const result = await raven.callTool('search_stellar_docs', { query: q });
      return sendJson(res, 200, { query: q, ravenResponse: result });
    }

    // 4. Conway Automaton Telemetry & Step
    if (pathname === '/api/conway/step' && (req.method === 'GET' || req.method === 'POST')) {
      const telemetry = automaton.step();
      return sendJson(res, 200, telemetry);
    }
    if (pathname === '/api/conway/pulse' && req.method === 'POST') {
      automaton.injectPaymentPulse();
      return sendJson(res, 200, { success: true, telemetry: automaton.getTelemetry() });
    }

    // 5. x402 Protected Endpoint: AI Deep Research
    if (pathname === '/api/ai/research') {
      const authHeader = req.headers['x402-payment-authorization'] || req.headers['authorization']?.replace(/^x402\s+/i, '');
      const challengeId = req.headers['x402-challenge-id'];

      if (authHeader && challengeId && challenges.has(challengeId)) {
        const challenge = challenges.get(challengeId);
        const verification = await verifyPaymentAuthorization(authHeader, challenge);
        if (verification.verified) {
          challenges.delete(challengeId);
          automaton.injectPaymentPulse();
          return sendJson(res, 200, {
            status: 'UNLOCKED_VIA_X402',
            resource: 'AI_DEEP_RESEARCH',
            receipt: verification.receipt,
            data: {
              summary: 'Stellar Protocol 23 introduces native host functions for ML-DSA (CAP-0087) and x402 agent payments.',
              keyTakeaways: [
                'Agents can settle HTTP 402 micro-invoices in under 5s using Soroban authorization entries.',
                'Stellar Raven MCP provides live official docs and playbooks directly to LLM context.',
                'Post-quantum signatures (1952B PK, 3309B Sig) offer long-term resistance against quantum cryptanalysis.',
              ],
              confidenceScore: 0.98,
              settledOnTestnet: true,
            },
          }, { [X402_CONFIG.HEADER_PAYMENT_RECEIPT]: JSON.stringify(verification.receipt) });
        }
      }

      // Return HTTP 402 Challenge
      const challenge = new X402Challenge({
        resourceId: 'AI_DEEP_RESEARCH',
        amountStroops: 500000n, // 0.05 QST
        assetCode: 'QST',
        destinationAccount: 'GDDESTINATIONTESTNETQSTELLAR777777777777777777777777777777',
      });
      challenges.set(challenge.challengeId, challenge);
      return sendJson(res, 402, {
        error: 'Payment Required',
        message: 'This intelligence endpoint requires an x402 micropayment of 0.05 QST',
        challenge: challenge.toJSON(),
      }, {
        [X402_CONFIG.HEADER_PAYMENT_REQUIRED]: challenge.toHeader(),
        'x402-challenge-id': challenge.challengeId,
      });
    }

    // 6. x402 Protected Endpoint: Market Intelligence
    if (pathname === '/api/market/intelligence') {
      const authHeader = req.headers['x402-payment-authorization'] || req.headers['authorization']?.replace(/^x402\s+/i, '');
      const challengeId = req.headers['x402-challenge-id'];

      if (authHeader && challengeId && challenges.has(challengeId)) {
        const challenge = challenges.get(challengeId);
        const verification = await verifyPaymentAuthorization(authHeader, challenge);
        if (verification.verified) {
          challenges.delete(challengeId);
          return sendJson(res, 200, {
            status: 'UNLOCKED_VIA_X402',
            resource: 'MARKET_INTELLIGENCE',
            receipt: verification.receipt,
            data: {
              dex24hVolumeUsdc: '4,821,902',
              activeSorobanContracts: 1420,
              agenticTransactionsShare: '18.4%',
              pqcAdoptionRate: '12.1%',
              topAssets: ['XLM', 'USDC', 'QST', 'EURC'],
            },
          });
        }
      }

      const challenge = new X402Challenge({
        resourceId: 'MARKET_INTELLIGENCE',
        amountStroops: 1000000n, // 0.10 QST
        assetCode: 'QST',
        destinationAccount: 'GDDESTINATIONTESTNETQSTELLAR777777777777777777777777777777',
      });
      challenges.set(challenge.challengeId, challenge);
      return sendJson(res, 402, {
        error: 'Payment Required',
        message: 'Market analytics endpoint requires 0.10 QST via x402',
        challenge: challenge.toJSON(),
      }, {
        [X402_CONFIG.HEADER_PAYMENT_REQUIRED]: challenge.toHeader(),
        'x402-challenge-id': challenge.challengeId,
      });
    }

    // 7. PQC Keygen & Verification API
    if (pathname === '/api/pqc/keygen' && req.method === 'POST') {
      const kp = generateMlDsa65KeyPair();
      return sendJson(res, 200, {
        algorithm: kp.algorithm,
        publicKeyHex: kp.publicKey.toString('hex'),
        publicKeyBytes: kp.publicKey.length,
        capReference: kp.capReference,
        securityCategory: 3,
      });
    }

    // 8. Privacy ZK-KYC Proof Generator & Verifier
    if (pathname === '/api/privacy/zk-kyc' && req.method === 'POST') {
      const body = await readBody(req);
      const proof = generateZkKycProof({
        account: body.account || 'GDALICE777777777777777777777777777777777777777777777777',
        jurisdiction: body.jurisdiction || 'US',
        minAge: body.minAge || 21,
      });
      const verification = verifyZkProof(proof);
      return sendJson(res, 200, { proof, verification });
    }

    // 404 Not Found
    return sendJson(res, 404, { error: 'Route not found', pathname });
  } catch (err) {
    return sendJson(res, 500, { error: 'Internal server error', details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 [QSTELLAR] API Gateway & x402 Facilitator running at http://localhost:${PORT}`);
});
