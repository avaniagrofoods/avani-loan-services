/**
 * APR-006 Phase 1 — AVANI LOAN SERVICES Website Remediation & Verification Suite
 * Synthetic test payloads ONLY. Uses ephemeral 127.0.0.1 stub for CRM sync (ZERO live network egress).
 */
'use strict';

const assert = require('assert');
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

async function main() {
  const EXPECTED_SLUGS = [
    'personal-loan',
    'business-loan',
    'doctor-loan',
    'mortgage-loan',
    'home-loan',
    'education-loan-india',
    'education-loan-global-studies',
    'school-and-college-funding'
  ];

  // T01: All 8 official loan slugs + public service pages
  await runTest('T01: All 8 official loan services present in services.json and public/services/', () => {
    const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'services.json'), 'utf8'));
    const slugs = services.map((s) => s.slug);
    assert.strictEqual(services.length, 8, `Expected 8 services, got ${services.length}`);
    for (const slug of EXPECTED_SLUGS) {
      assert.ok(slugs.includes(slug), `Missing service slug: ${slug}`);
      const staticPage = path.join(ROOT, 'public', 'services', slug, 'index.html');
      assert.ok(fs.existsSync(staticPage), `Missing static SEO page: ${staticPage}`);
    }
  });

  // T02: Sitemap & Robots cover all 8 loan slugs on canonical domain
  await runTest('T02: public/sitemap.xml and public/robots.txt valid and include all 8 loan slugs', () => {
    const sitemap = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
    const robots = fs.readFileSync(path.join(ROOT, 'public', 'robots.txt'), 'utf8');
    assert.ok(sitemap.includes('https://www.avanifinserv.com'), 'Sitemap missing canonical domain');
    assert.ok(robots.includes('Sitemap: https://www.avanifinserv.com/sitemap.xml'), 'robots.txt missing sitemap URL');
    for (const slug of EXPECTED_SLUGS) {
      assert.ok(sitemap.includes(`/services/${slug}`), `Sitemap missing /services/${slug}`);
    }
  });

  // T03: Advisory compliance — zero affirmative guarantee / direct-lender claims
  await runTest('T03: services.json uses compliant consultancy language with zero affirmative guarantee claims', () => {
    const raw = fs.readFileSync(path.join(ROOT, 'src', 'data', 'services.json'), 'utf8');
    assert.ok(!/\b100%\s+guaranteed\s+approval\b/i.test(raw), 'Found uncompliant guaranteed approval claim');
    assert.ok(!/\binstant\s+approval\s+guaranteed\b/i.test(raw), 'Found uncompliant instant approval claim');
    assert.ok(!/\bwe\s+are\s+a\s+bank\b/i.test(raw), 'Found uncompliant bank claim');
    const biz = fs.readFileSync(path.join(ROOT, 'src', 'config', 'officialBusiness.js'), 'utf8');
    assert.ok(biz.includes('413512'), 'officialBusiness.js missing canonical PIN 413512');
    assert.ok(biz.includes('9175635165'), 'officialBusiness.js missing canonical phone 9175635165');
  });

  // Load ESM api/save-lead.js dynamically
  const saveLeadUrl = pathToFileURL(path.join(ROOT, 'api', 'save-lead.js')).href;
  const saveLeadMod = await import(saveLeadUrl);
  const handler = saveLeadMod.default;

  // T04: Omitted consent MUST be rejected with HTTP 403 (APR006-P1-01)
  await runTest('T04: api/save-lead rejects omitted consent field with HTTP 403', async () => {
    const res = makeRes();
    await handler({
      method: 'POST',
      body: { name: 'Synthetic Applicant', phone: '9876543210', loanType: 'Personal Loan' }
    }, res);
    assert.strictEqual(res.statusCode, 403, `Expected 403, got ${res.statusCode}`);
    assert.strictEqual(res.body.success, false);
    assert.ok(/DPDP/i.test(res.body.error), 'Expected DPDP error message');
  });

  // T05: Explicit denial & contradictory consent rejected with HTTP 403 (APR006-P1-01)
  await runTest('T05: api/save-lead rejects false/DENIED/REVOKED/contradictory consent with HTTP 403', async () => {
    const cases = [
      { consent: false },
      { consentStatus: 'DENIED' },
      { consentStatus: 'REVOKED' },
      { consentStatus: 'OPTED_OUT' },
      { consent: true, consentStatus: 'DENIED' },
      { consent: false, consentStatus: 'GRANTED' }
    ];
    for (const c of cases) {
      const res = makeRes();
      await handler({
        method: 'POST',
        body: { name: 'Synthetic Applicant', phone: '9876543210', ...c }
      }, res);
      assert.strictEqual(res.statusCode, 403, `Expected 403 for ${JSON.stringify(c)}, got ${res.statusCode}`);
    }
  });

  // T06: Invalid optional email rejected with HTTP 400 (APR006-P1-02)
  await runTest('T06: api/save-lead rejects malformed email with HTTP 400', async () => {
    const res = makeRes();
    await handler({
      method: 'POST',
      body: { name: 'Synthetic Applicant', phone: '9876543210', email: 'not-an-email', consent: true }
    }, res);
    assert.strictEqual(res.statusCode, 400, `Expected 400, got ${res.statusCode}`);
    assert.ok(/email/i.test(res.body.error));
  });

  // T07: Valid explicit opt-in forwards to local stub CRM & absorbs duplicate cleanly (ZERO external calls)
  await runTest('T07: api/save-lead accepts explicit opt-in, syncs to local stub, and deduplicates cleanly', async () => {
    const received = [];
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        received.push({ url: req.url, payload: JSON.parse(body || '{}') });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, leadId: 'CRM-STUB-999001' }));
      });
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    const prevEnv = {
      AVANI_CRM_URL: process.env.AVANI_CRM_URL,
      NEXT_PUBLIC_CRM_URL: process.env.NEXT_PUBLIC_CRM_URL,
      PICKY_ASSIST_URL: process.env.PICKY_ASSIST_URL,
      GOOGLE_SHEET_APP_SCRIPT_URL: process.env.GOOGLE_SHEET_APP_SCRIPT_URL,
      GOOGLE_WEB_APP_URL: process.env.GOOGLE_WEB_APP_URL,
      PABBLY_CONNECT_URL: process.env.PABBLY_CONNECT_URL,
      ZAPIER_WEBHOOK_URL: process.env.ZAPIER_WEBHOOK_URL
    };

    process.env.AVANI_CRM_URL = `http://127.0.0.1:${port}`;
    delete process.env.NEXT_PUBLIC_CRM_URL;
    delete process.env.PICKY_ASSIST_URL;
    delete process.env.GOOGLE_SHEET_APP_SCRIPT_URL;
    delete process.env.GOOGLE_WEB_APP_URL;
    delete process.env.PABBLY_CONNECT_URL;
    delete process.env.ZAPIER_WEBHOOK_URL;

    try {
      const idempKey = `TEST-APR006-${Date.now()}`;
      const payload = {
        name: 'Synthetic Test Lead',
        phone: '9876543210',
        email: 'synthetic.test@example.com',
        loanType: 'Doctor Loan',
        consent: true,
        idempotencyKey: idempKey
      };

      const res1 = makeRes();
      await handler({ method: 'POST', body: payload }, res1);
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(res1.body.success, true);
      assert.strictEqual(res1.body.leadId, 'CRM-STUB-999001');
      assert.strictEqual(res1.body.productCategory, 'DOCTOR_LOAN');
      assert.strictEqual(res1.body.syncResults.crm, true);
      assert.strictEqual(received.length, 1);
      assert.strictEqual(received[0].url, '/api/public/enquiry');
      assert.strictEqual(received[0].payload.consent, true);
      assert.strictEqual(received[0].payload.consentStatus, 'GRANTED');

      // Duplicate submission within 30s window must hit idempotency cache without calling CRM again
      const res2 = makeRes();
      await handler({ method: 'POST', body: payload }, res2);
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res2.body.idempotencyHit, true);
      assert.strictEqual(res2.body.leadId, 'CRM-STUB-999001');
      assert.strictEqual(received.length, 1, 'Duplicate submission should not re-call CRM');
    } finally {
      for (const [k, v] of Object.entries(prevEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // T08: Bounded idempotency cache pruning (APR006-P1-02)
  await runTest('T08: pruneIdempotencyCache evicts expired entries and enforces strict maxEntries bound', () => {
    const testMap = new Map();
    const now = 1000000;
    testMap.set('expired-1', { leadId: 'L0', timestamp: now - 400000 });
    for (let i = 1; i <= 15; i++) {
      testMap.set(`fresh-${i}`, { leadId: `L${i}`, timestamp: now - 1000 + i });
    }
    const remaining = saveLeadMod.pruneIdempotencyCache(now, testMap, 10);
    assert.strictEqual(testMap.has('expired-1'), false, 'Expired entry was not pruned');
    assert.strictEqual(remaining, 9, `Expected size 9 (< maxEntries 10), got ${remaining}`);
    assert.strictEqual(testMap.has('fresh-1'), false, 'Oldest entry should be evicted under cap');
    assert.strictEqual(testMap.has('fresh-15'), true, 'Newest entry must be preserved');
  });

  // T09: WhatsAppButton enforces DPDP consent checkbox before submitting
  await runTest('T09: WhatsAppButton.jsx requires explicit DPDP consent before posting to /api/save-lead', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'components', 'WhatsAppButton.jsx'), 'utf8');
    assert.ok(src.includes('consent: false'), 'WhatsAppButton must initialize consent as false');
    assert.ok(src.includes('if (!formData.consent) return'), 'WhatsAppButton must guard submit on consent');
    assert.ok(src.includes("consentStatus: 'GRANTED'"), 'WhatsAppButton must send explicit consentStatus');
  });

  console.log(`\nAPR-006 Phase 1 Website Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
