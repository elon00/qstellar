import { StellarRavenClient } from './index.js';

console.log('🧪 [TEST] Running Stellar Raven MCP Client Test Suite...');

const client = new StellarRavenClient();
const conn = await client.connect();
console.assert(conn.status === 'CONNECTED', 'Raven client must connect');
console.log(`✅ [1/3] Connected to Raven MCP at ${conn.endpoint}`);

const tools = await client.listTools();
console.assert(tools.length >= 4, 'Must list at least 4 MCP tools');
console.log(`✅ [2/3] Retrieved ${tools.length} Raven MCP tools: ${tools.map((t) => t.name).join(', ')}`);

const capResult = await client.callTool('lookup_standard', { standardId: 'CAP-0087' });
console.assert(capResult.standard === 'CAP-0087', 'Standard must match CAP-0087');
console.log(`✅ [3/3] Standard lookup returned CAP-0087: ${capResult.data.title}`);

console.log('🎉 All Stellar Raven MCP tests passed successfully!\n');
