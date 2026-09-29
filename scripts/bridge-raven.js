#!/usr/bin/env node
/**
 * QSTELLAR RAVEN MCP BRIDGE
 * Bridges local AI agents with SDF's remote Stellar Raven MCP server
 * using mcp-remote with HTTP-only transport.
 */

import { spawn } from 'node:child_process';
import https from 'node:https';

const RAVEN_BASE = 'https://raven.stellar.org';
const RAVEN_MCP_ENDPOINT = `${RAVEN_BASE}/mcp`;

console.log('🦅 [QSTELLAR] Initializing Stellar Raven Remote MCP Bridge...');
console.log(`📡 Target MCP Endpoint: ${RAVEN_MCP_ENDPOINT}`);

// 1. Check live service health
function checkHealth() {
  return new Promise((resolve) => {
    https.get(`${RAVEN_BASE}/health`, (res) => {
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

const health = await checkHealth();
if (health.statusCode === 200) {
  console.log(`✅ [HEALTH] Stellar Raven is LIVE: ${health.body.trim() || 'OK (200)'}`);
} else {
  console.log(`⚠️  [HEALTH] Raven returned status ${health.statusCode}. Running bridge with fallback...`);
}

// 2. Launch mcp-remote bridge
console.log('🚀 Spawning mcp-remote bridge process...');
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['-y', 'mcp-remote@latest', RAVEN_MCP_ENDPOINT, '--transport', 'http-only'];

console.log(`$ ${cmd} ${args.join(' ')}\n`);

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('❌ Failed to start mcp-remote bridge:', err);
});

child.on('close', (code) => {
  console.log(`🔌 Raven MCP Bridge exited with code ${code}`);
});
