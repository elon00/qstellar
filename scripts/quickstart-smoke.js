#!/usr/bin/env node

const base = process.env.STELLAR_QUICKSTART_URL || 'http://127.0.0.1:8000';

async function mustFetch(name, url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${name} failed: HTTP ${res.status}`);
  return res;
}

console.log('QSTELLAR Quickstart smoke test');
console.log('Endpoint:', base);

const horizon = await mustFetch('Horizon', `${base}/`);
const horizonJson = await horizon.json();
if (!horizonJson.network_passphrase) {
  throw new Error('Horizon root did not return network_passphrase');
}
console.log('PASS Horizon:', horizonJson.network_passphrase);

const rpc = await mustFetch('RPC', `${base}/rpc`, {
  method: 'POST',
  headers: {'content-type':'application/json'},
  body: JSON.stringify({jsonrpc:'2.0', id:1, method:'getHealth'})
});
const rpcJson = await rpc.json();
if (rpcJson.error) throw new Error(`RPC getHealth error: ${JSON.stringify(rpcJson.error)}`);
console.log('PASS RPC getHealth:', JSON.stringify(rpcJson.result));

const lab = await mustFetch('Stellar Lab', `${base}/lab`);
console.log('PASS Stellar Lab:', lab.status);

console.log('PASS Quickstart core/horizon/rpc/lab smoke checks');
