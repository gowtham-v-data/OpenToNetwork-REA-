/**
 * REA Data Extractor
 * Reads the evidence.json captured by REA and extracts:
 * - All network request/response pairs (URLs, methods, headers, bodies)
 * - DOM structure
 * - Storage data
 * - API contracts
 */

const fs = require('fs');
const path = require('path');

const evidencePath = path.join(__dirname, 'evidence.json');
const ev = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

const rec = ev.records[0];
const nr = rec.normalized_result;

console.log('\n========== REA CAPTURE SUMMARY ==========');
console.log('Evidence ID:', rec.evidence_id);
console.log('Browser:', JSON.stringify(nr.browser));
console.log('Duration:', nr.duration_ms, 'ms');
console.log('Status:', nr.completeness.status);
console.log('Missing:', nr.completeness.missing_sections);

// ---- NETWORK EVENTS ----
const events = nr.events.items || [];
console.log('\n========== NETWORK EVENTS (' + events.length + ') ==========');

const requests = events.filter(e => e.kind === 'request');
const responses = events.filter(e => e.kind === 'response');

console.log('Requests:', requests.length);
console.log('Responses:', responses.length);

// Group by URL
const byUrl = {};
events.forEach(e => {
  const url = e.url?.url || e.url;
  if (!byUrl[url]) byUrl[url] = { req: null, res: null };
  if (e.kind === 'request') byUrl[url].req = e;
  if (e.kind === 'response') byUrl[url].res = e;
});

console.log('\n--- ALL CAPTURED URLS ---');
Object.keys(byUrl).forEach(url => {
  const pair = byUrl[url];
  const method = pair.req?.method || '?';
  const status = pair.res?.status || '?';
  const type = pair.req?.resource_type || '?';
  console.log(`  [${method}] ${status} (${type}) ${url}`);
});

// ---- DOM / STORAGE ----
console.log('\n========== DOM & STORAGE ==========');
if (nr.dom) {
  console.log('DOM length:', nr.dom.length);
} else {
  console.log('DOM: not captured in normalized_result');
}

// Check for storage
if (nr.storage) {
  console.log('Storage keys:', Object.keys(nr.storage));
} else {
  console.log('Storage: not captured');
}

// ---- API CONTRACTS ----
console.log('\n========== EXTRACTED API CONTRACTS ==========');
const apiCalls = Object.keys(byUrl).filter(url => {
  return url.includes('/api/') || url.includes('/li/') || url.includes('/litms/') || url.includes('/feed/') || url.includes('/jobs/');
});
console.log('API Endpoints found:', apiCalls.length);
apiCalls.forEach(url => {
  const pair = byUrl[url];
  console.log(`  ${pair.req?.method || 'GET'} ${url}`);
  if (pair.res?.body) console.log('    Body preview:', JSON.stringify(pair.res.body).slice(0, 100));
});

// ---- SAVE EXTRACTED DATA ----
const extracted = {
  evidenceId: rec.evidence_id,
  capturedAt: new Date().toISOString(),
  browser: nr.browser,
  durationMs: nr.duration_ms,
  totalEvents: events.length,
  urlPairs: byUrl,
  apiEndpoints: apiCalls.map(url => ({
    url,
    method: byUrl[url].req?.method,
    status: byUrl[url].res?.status,
    resourceType: byUrl[url].req?.resource_type,
    responseHeaders: byUrl[url].res?.header_names,
    body: byUrl[url].res?.body
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'extracted_rea_data.json'),
  JSON.stringify(extracted, null, 2)
);
console.log('\n✅ Saved to extracted_rea_data.json');
