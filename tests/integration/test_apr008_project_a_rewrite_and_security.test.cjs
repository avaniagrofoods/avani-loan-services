/**
 * APR-008 Phase 3/4 — Project A Routing, Rewrite Verification & Security Hardening Suite
 * Synthetic payloads ONLY. Ephemeral 127.0.0.1 stub for CRM sync (ZERO live network egress).
 */
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    failed++;
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
    send(val) { this.body = val; return this; }
  };
}

/**
 * Deterministic Vercel routing resolver matching Vercel Build Output v3 specification:
 * Phase 1: Filesystem check (public/* static files & api/*.js serverless functions)
 * Phase 2: Top-level vercel.json rewrites (afterFiles)
 */
function simulateVercelRoute(reqPath, vercelCfg, apiFilesSet, publicFilesSet) {
  // Normalize exact match against api/*.js functions (no trailing slash)
  if (reqPath.startsWith('/api/') && !reqPath.endsWith('/')) {
    const fnName = reqPath.slice('/api/'.length) + '.js';
    if (apiFilesSet.has(fnName)) {
      return { phase: 'filesystem_function', target: `api/${fnName}`, interceptedByRewrite: false };
    }
  }
  if (publicFilesSet.has(reqPath)) {
    return { phase: 'filesystem_static', target: reqPath, interceptedByRewrite: false };
  }
  for (const rw of vercelCfg.rewrites || []) {
    const rx = new RegExp('^' + rw.source + '$');
    const m = reqPath.match(rx);
    if (m) {
      let dest = rw.destination;
      for (let i = 1; i < m.length; i++) dest = dest.replace(`$${i}`, m[i] || '');
      return { phase: 'rewrite', target: dest, interceptedByRewrite: true };
    }
  }
  return { phase: '404', target: null, interceptedByRewrite: false };
}

async function main() {
  const vercelCfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const apiFiles = new Set(fs.readdirSync(path.join(ROOT, 'api')).filter((f) => f.endsWith('.js')));

  await runTest('T01: vercel.json security headers & ESM serverless module compatibility verified', () => {
    assert.strictEqual(pkg.type, 'module', 'Project A package.json must declare type=module');
    const hdrKeys = (vercelCfg.headers?.[0]?.headers || []).map((h) => h.key);
    for (const reqHdr of ['X-Content-Type-Options', 'X-Frame-Options', 'Strict-Transport-Security', 'Referrer-Policy']) {
      assert.ok(hdrKeys.includes(reqHdr), `Missing security header in vercel.json: ${reqHdr}`);
    }
    for (const fn of ['save-lead.js', 'health.js', 'track-click.js', 'vapi-callback.js', 'index.js']) {
      assert.ok(apiFiles.has(fn), `Expected api/${fn} to exist`);
      const src = fs.readFileSync(path.join(ROOT, 'api', fn), 'utf8');
      assert.ok(/export\s+default\s+/.test(src), `api/${fn} must use ESM export default`);
    }
  });

  await runTest('T02: Vercel routing simulator proves /api/save-lead resolves to serverless fn while trailing-slash & unmatched /api/* fall through to rewrite', () => {
    const publicFiles = new Set(['/robots.txt', '/sitemap.xml', '/services/personal-loan/index.html']);

    const saveLead = simulateVercelRoute('/api/save-lead', vercelCfg, apiFiles, publicFiles);
    assert.strictEqual(saveLead.phase, 'filesystem_function');
    assert.strictEqual(saveLead.target, 'api/save-lead.js');
    assert.strictEqual(saveLead.interceptedByRewrite, false);

    const health = simulateVercelRoute('/api/health', vercelCfg, apiFiles, publicFiles);
    assert.strictEqual(health.phase, 'filesystem_function');
    assert.strictEqual(health.target, 'api/health.js');

    // Trailing slash edge case & unmatched /api/portal/* fall through to L35 VM proxy rewrite!
    const trailingSlash = simulateVercelRoute('/api/save-lead/', vercelCfg, apiFiles, publicFiles);
    assert.strictEqual(trailingSlash.phase, 'rewrite');
    assert.ok(trailingSlash.target.startsWith('https://api.avanifinserv.com/api/'));

    const portalApi = simulateVercelRoute('/api/portal/builder/companies', vercelCfg, apiFiles, publicFiles);
    assert.strictEqual(portalApi.phase, 'rewrite');
    assert.strictEqual(portalApi.target, 'https://api.avanifinserv.com/api/portal/builder/companies');

    // Public SPA routes resolve to /index.html
    const spaRoute = simulateVercelRoute('/loans', vercelCfg, apiFiles, publicFiles);
    assert.strictEqual(spaRoute.phase, 'rewrite');
    assert.strictEqual(spaRoute.target, '/index.html');
  });

  await runTest('T03: api/health.js returns HTTP 200 status=ok', async () => {
    const healthMod = await import(pathToFileURL(path.join(ROOT, 'api', 'health.js')).href);
    const res = makeRes();
    healthMod.default({ method: 'GET' }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  await runTest('T04: api/save-lead.js enforces method (405), validation (400), DPDP consent (403) & localhost stub sync (200)', async () => {
    const saveLeadMod = await import(pathToFileURL(path.join(ROOT, 'api', 'save-lead.js')).href);
    const handler = saveLeadMod.default;

    const r405 = makeRes();
    await handler({ method: 'GET' }, r405);
    assert.strictEqual(r405.statusCode, 405);

    const r400 = makeRes();
    await handler({ method: 'POST', body: { name: 'Only Name' } }, r400);
    assert.strictEqual(r400.statusCode, 400);

    const r403 = makeRes();
    await handler({ method: 'POST', body: { name: 'Synthetic', phone: '9876543210' } }, r403);
    assert.strictEqual(r403.statusCode, 403);

    const stub = http.createServer((_req, res) => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, leadId: 'APR008-STUB-01' }));
    });
    await new Promise((resolve) => stub.listen(0, '127.0.0.1', resolve));
    const prevUrl = process.env.AVANI_CRM_URL;
    process.env.AVANI_CRM_URL = `http://127.0.0.1:${stub.address().port}`;
    try {
      const r200 = makeRes();
      await handler({
        method: 'POST',
        body: { name: 'Synthetic Lead', phone: '9876543211', email: 'synth@example.com', consent: true, idempotencyKey: `APR008-${Date.now()}` }
      }, r200);
      assert.strictEqual(r200.statusCode, 200);
      assert.strictEqual(r200.body.leadId, 'APR008-STUB-01');
    } finally {
      if (prevUrl === undefined) delete process.env.AVANI_CRM_URL;
      else process.env.AVANI_CRM_URL = prevUrl;
      await new Promise((resolve) => stub.close(resolve));
    }
  });

  await runTest('T05: Phase 3A redacted Project A doc has zero Meta EAA token literals remaining', () => {
    const doc = fs.readFileSync(path.join(ROOT, 'Bland AI Calling & Drip Campaign Implementation Walkthrough.md'), 'utf8');
    assert.strictEqual(/EAA[A-Za-z0-9]{25,}/.test(doc), false, 'Unredacted Meta EAA token found in Bland walkthrough doc');
    assert.ok(doc.includes('[REDACTED_META_ACCESS_TOKEN]'), 'Expected redaction placeholder marker');
  });

  await runTest('T06: Deferred APR005-F-007 (calculatorAuth.cjs:L13) remains strictly untouched', () => {
    const line13 = fs.readFileSync(path.join(ROOT, 'src', 'routes', 'calculatorAuth.cjs'), 'utf8').split(/\r?\n/)[12] || '';
    const h = crypto.createHash('sha256').update(line13, 'utf8').digest('hex');
    assert.strictEqual(h, '01b33326c3e1c1df71fce79d28d7a19be5231be1349493e2bd3ff8c2a32c1b68');
  });

  console.log(`\nAPR-008 Project A Rewrite & Security Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
