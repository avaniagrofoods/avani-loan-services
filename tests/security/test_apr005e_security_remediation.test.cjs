/**
 * APR-005E — Focused Security Remediation & Zero-Defect Regression Suite (Project A)
 * Uses synthetic test fixtures ONLY. Zero live network egress. Zero raw secrets.
 */
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
    send(val) { this.body = val; return this; },
    sendStatus(code) { this.statusCode = code; return this; }
  };
}

async function main() {
  const { workerAuthMiddleware } = require('../../src/middleware/workerAuth.cjs');
  const portalAuth = require('../../src/services/portalAuthService.cjs');
  const aisensyAdapter = require('../../src/services/aisensyAdapter.cjs');

  // 1-4: workerAuthMiddleware fail-closed & timing-safe auth
  await runTest('T01: workerAuthMiddleware fails closed (503) when INTERNAL_WORKER_SECRET is unset', () => {
    const prev = process.env.INTERNAL_WORKER_SECRET;
    delete process.env.INTERNAL_WORKER_SECRET;
    try {
      let nextCalled = false;
      const res = makeRes();
      workerAuthMiddleware({ headers: { 'x-worker-auth': 'AVANI_WORKER_SECRET_2026' } }, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 503);
      assert.strictEqual(res.body.error, 'WORKER_SECRET_UNCONFIGURED');
    } finally {
      if (prev !== undefined) process.env.INTERNAL_WORKER_SECRET = prev;
    }
  });

  await runTest('T02: workerAuthMiddleware rejects legacy hardcoded fallback secret with 401 when configured', () => {
    const prev = process.env.INTERNAL_WORKER_SECRET;
    process.env.INTERNAL_WORKER_SECRET = 'synthetic_test_worker_secret_32_chars_ok';
    try {
      let nextCalled = false;
      const res = makeRes();
      workerAuthMiddleware({ headers: { 'x-worker-auth': 'AVANI_WORKER_SECRET_2026' } }, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
    } finally {
      if (prev !== undefined) process.env.INTERNAL_WORKER_SECRET = prev;
      else delete process.env.INTERNAL_WORKER_SECRET;
    }
  });

  await runTest('T03: workerAuthMiddleware rejects missing header with 401', () => {
    const prev = process.env.INTERNAL_WORKER_SECRET;
    process.env.INTERNAL_WORKER_SECRET = 'synthetic_test_worker_secret_32_chars_ok';
    try {
      let nextCalled = false;
      const res = makeRes();
      workerAuthMiddleware({ headers: {} }, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
    } finally {
      if (prev !== undefined) process.env.INTERNAL_WORKER_SECRET = prev;
      else delete process.env.INTERNAL_WORKER_SECRET;
    }
  });

  await runTest('T04: workerAuthMiddleware accepts exact configured secret', () => {
    const prev = process.env.INTERNAL_WORKER_SECRET;
    process.env.INTERNAL_WORKER_SECRET = 'synthetic_test_worker_secret_32_chars_ok';
    try {
      let nextCalled = false;
      const res = makeRes();
      workerAuthMiddleware({ headers: { 'x-worker-auth': 'synthetic_test_worker_secret_32_chars_ok' } }, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
    } finally {
      if (prev !== undefined) process.env.INTERNAL_WORKER_SECRET = prev;
      else delete process.env.INTERNAL_WORKER_SECRET;
    }
  });

  // 5-8: portalAuthService secret hygiene & hashed session storage (APR005-F-017)
  await runTest('T05: portalAuthService contains zero hardcoded static JWT fallback literal', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'services', 'portalAuthService.cjs'), 'utf8');
    assert.strictEqual(/AVANI_PORTAL_SECURE_KEY/.test(src), false);
  });

  await runTest('T06: portalAuthService.issueSession stores SHA-256 token_hash only (never raw JWT on disk)', async () => {
    const prevSecret = process.env.CALCULATOR_SESSION_SECRET;
    process.env.CALCULATOR_SESSION_SECRET = 'synthetic_portal_jwt_secret_for_unit_test_01';
    try {
      const issued = await portalAuth.issueSession({
        user_id: 'SYNTH_USER_01',
        username: 'synth_admin',
        email: 'synth@example.invalid',
        role: 'Read-Only Analyst',
        must_change_password: false
      }, '127.0.0.1', 'apr005e-test');
      assert.ok(issued.token && issued.token.split('.').length === 3);
      assert.strictEqual(issued.session.token, undefined, 'Persisted session must NOT contain plaintext token');
      assert.strictEqual(
        issued.session.token_hash,
        crypto.createHash('sha256').update(issued.token).digest('hex')
      );
      const verified = portalAuth.verifyToken(issued.token);
      assert.strictEqual(verified.userId, 'SYNTH_USER_01');
      assert.strictEqual(portalAuth.verifyToken(issued.token + 'tampered'), null);
      await portalAuth.revokeSession(issued.sessionId);
    } finally {
      if (prevSecret !== undefined) process.env.CALCULATOR_SESSION_SECRET = prevSecret;
      else delete process.env.CALCULATOR_SESSION_SECRET;
    }
  });

  await runTest('T07: portalAuthService fails closed in production when JWT secrets are unset', async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevCalc = process.env.CALCULATOR_SESSION_SECRET;
    const prevJwt = process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    delete process.env.CALCULATOR_SESSION_SECRET;
    delete process.env.JWT_SECRET;
    try {
      let threw = false;
      try {
        await portalAuth.issueSession({ user_id: 'SYNTH_PROD_FAIL', username: 'x', role: 'Read-Only Analyst' });
      } catch (e) {
        threw = /PORTAL_JWT_SECRET_UNCONFIGURED/.test(e.message);
      }
      assert.strictEqual(threw, true, 'Must throw PORTAL_JWT_SECRET_UNCONFIGURED in production');
      assert.strictEqual(portalAuth.verifyToken('a.b.c'), null);
    } finally {
      if (prevNodeEnv !== undefined) process.env.NODE_ENV = prevNodeEnv; else delete process.env.NODE_ENV;
      if (prevCalc !== undefined) process.env.CALCULATOR_SESSION_SECRET = prevCalc;
      if (prevJwt !== undefined) process.env.JWT_SECRET = prevJwt;
    }
  });

  // 8-9: api/vapi-callback.js hardcoded URL removal & fail-closed auth
  await runTest('T08: api/vapi-callback.js contains zero hardcoded Pabbly URLs and requires VAPI_WEBHOOK_SECRET', () => {
    const src = fs.readFileSync(path.join(ROOT, 'api', 'vapi-callback.js'), 'utf8');
    assert.strictEqual(/connect\.pabbly\.com\/webhook-listener/i.test(src), false);
    assert.strictEqual(/hook\.pabbly\.com\/api\/webhook/i.test(src), false);
    assert.strictEqual(/VAPI_WEBHOOK_SECRET/.test(src), true);
    assert.strictEqual(/timingSafeEqual/.test(src), true);
    assert.strictEqual(/WEBHOOK_NOT_CONFIGURED/.test(src), true);
  });

  // 10: hubSpot.cjs zero hardcoded token literal
  await runTest('T09: src/utils/hubSpot.cjs contains zero hardcoded na2- HubSpot token literal', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'utils', 'hubSpot.cjs'), 'utf8');
    assert.strictEqual(/na2-[0-9a-f-]{10,}/i.test(src), false);
  });

  // 11-12: aisensyAdapter.cjs fail-closed & zero PII/apiKey leak
  await runTest('T10: aisensyAdapter fails closed when AISENSY_API_KEY is unset in live mode', async () => {
    const prevKey = process.env.AISENSY_API_KEY;
    const prevMode = process.env.PROVIDER_MODE;
    delete process.env.AISENSY_API_KEY;
    process.env.PROVIDER_MODE = 'live';
    try {
      const res = await aisensyAdapter.sendWhatsAppTemplate({
        destination: '919900001234',
        campaignName: 'synth_campaign',
        templateParams: ['Synthetic User']
      });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 'AISENSY_NOT_CONFIGURED');
      assert.strictEqual(res.payload, undefined);
    } finally {
      if (prevKey !== undefined) process.env.AISENSY_API_KEY = prevKey;
      if (prevMode !== undefined) process.env.PROVIDER_MODE = prevMode; else delete process.env.PROVIDER_MODE;
    }
  });

  await runTest('T11: aisensyAdapter mock mode masks phone, omits apiKey, and logs zero raw PII', async () => {
    const prevMode = process.env.PROVIDER_MODE;
    process.env.PROVIDER_MODE = 'mock';
    const captured = [];
    const origLog = console.log;
    console.log = (...args) => captured.push(args.join(' '));
    try {
      const res = await aisensyAdapter.sendWhatsAppTemplate({
        destination: '919900001234',
        campaignName: 'synth_campaign',
        templateParams: ['Synthetic SecretName']
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.mock, true);
      assert.strictEqual(res.apiKey, undefined);
      assert.strictEqual(res.payload, undefined);
      assert.strictEqual(res.destinationMasked, '********1234');
      const allLogs = captured.join('\n');
      assert.strictEqual(allLogs.includes('919900001234'), false, 'Raw phone must not appear in console.log');
      assert.strictEqual(allLogs.includes('Synthetic SecretName'), false, 'Customer name must not appear in console.log');
    } finally {
      console.log = origLog;
      if (prevMode !== undefined) process.env.PROVIDER_MODE = prevMode; else delete process.env.PROVIDER_MODE;
    }
  });

  // 13-16: PII masking & webhook auth across whatsapp.cjs, centralLeadEngine.cjs, omnidmService.cjs, whatsappQualificationEngine.cjs
  await runTest('T12: whatsapp.cjs does not dump raw JSON.stringify(body) or echo err.message', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'routes', 'whatsapp.cjs'), 'utf8');
    assert.strictEqual(/JSON\.stringify\(body\)/.test(src), false);
    assert.strictEqual(/status\(500\)\.json\(\{\s*error:\s*err\.message/.test(src), false);
  });

  await runTest('T13: centralLeadEngine.cjs masks mobile number in duplicate logs', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'services', 'centralLeadEngine.cjs'), 'utf8');
    assert.strictEqual(/Duplicate detected for mobile \$\{mobile\}/.test(src), false);
    assert.strictEqual(/maskedMobile/.test(src), true);
  });

  await runTest('T14: omnidmService.cjs removes hardcoded IDs, removes raw payload logging, enforces fail-closed auth', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'services', 'omnidmService.cjs'), 'utf8');
    assert.strictEqual(/console\.log\('\[OmniDM\] Webhook received:',\s*payload\)/.test(src), false);
    assert.strictEqual(/'2049842548930849'/.test(src), false);
    assert.strictEqual(/timingSafeEqual/.test(src), true);
    assert.strictEqual(/OMNIDM_WEBHOOK_NOT_CONFIGURED/.test(src), true);
  });

  await runTest('T15: whatsappQualificationEngine.cjs masks phone numbers and omits raw customer name/message in logs', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'services', 'whatsappQualificationEngine.cjs'), 'utf8');
    assert.strictEqual(/Firing drip message to \$\{fromPhone\}/.test(src), false);
    assert.strictEqual(/Mock Message Dispatched to \$\{formattedPhone\}/.test(src), false);
    assert.strictEqual(/payload\.name\)/.test(src), false);
    assert.strictEqual(/Incoming from \$\{fromPhone\}/.test(src), false);
  });

  // 17: GitHub Actions least-privilege permissions (APR005-F-003)
  await runTest('T16: .github/workflows/deploy.yml defines explicit least-privilege permissions: contents: read', () => {
    const yml = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf8');
    assert.strictEqual(/permissions:\s*\r?\n\s*contents:\s*read/.test(yml), true);
  });

  // 18: Deferred APR005-F-007 boundary proof (calculatorAuth.cjs:L13 MUST remain untouched!)
  await runTest('T17: Deferred APR005-F-007 calculatorAuth.cjs:L13 remains cryptographically untouched', () => {
    const lines = fs.readFileSync(path.join(ROOT, 'src', 'routes', 'calculatorAuth.cjs'), 'utf8').split(/\r?\n/);
    const sha = crypto.createHash('sha256').update(lines[12] || '').digest('hex');
    assert.strictEqual(sha, '01b33326c3e1c1df71fce79d28d7a19be5231be1349493e2bd3ff8c2a32c1b68');
  });

  console.log(`\nAPR-005E PROJECT A SECURITY SUITE: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
