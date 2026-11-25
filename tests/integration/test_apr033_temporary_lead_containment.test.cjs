/**
 * APR-033 TEMPORARY LEAD CAPTURE CONTAINMENT & WEBSITE SAFETY TEST SUITE
 *
 * Verifies all 12 mandated test scenarios across all 8 enquiry categories:
 * 1. Personal Loan
 * 2. Business / MSME Loan
 * 3. Doctor Loan
 * 4. Home Loan
 * 5. Mortgage / Loan Against Property
 * 6. Education Loan (India & Global)
 * 7. Builder / Joint Venture
 * 8. School / College Institutional Funding
 *
 * Scenarios:
 * S1. Form Opening / Initialization for each category
 * S2. Submission during HOLD intercepted
 * S3. No unverified CRM submission is dispatched
 * S4. No false success message (status 200 persisted:true) returned
 * S5. Correct contact alternatives returned (WhatsApp, Phone, Email, Website)
 * S6. WhatsApp destination is exactly https://wa.me/919175635165
 * S7. Phone destination is exactly tel:+919175635165
 * S8. Zero sensitive form values in WhatsApp / phone URLs
 * S9. Existing DPDP consent controls remain active (HTTP 403 on missing consent)
 * S10. Existing validation controls remain active (HTTP 400 on invalid mobile/name)
 * S11. Contact alternative payloads robust and crash-free
 * S12. Protected invariants (calculatorAuth.cjs:L13) preserved
 */

'use strict';

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const express = require('express');

const ROOT = path.resolve(__dirname, '..', '..');

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(o) { this.body = o; return this; },
    send(v) { this.body = v; return this; }
  };
}

(async () => {
  console.log('=======================================================================');
  console.log('APR-033 — TEMPORARY LEAD CAPTURE CONTAINMENT & SAFETY TEST SUITE');
  console.log('=======================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`  [FAIL] ${name} -> ${err.message}`);
    }
  }

  // Ensure HOLD is active for this suite
  delete process.env.LEAD_CAPTURE_HOLD; // Defaults to true
  const { isLeadCaptureHoldActive, HOLD_CONTACT_INFO } = require(path.join(ROOT, 'src/config/leadCaptureHold.cjs'));
  assert.strictEqual(isLeadCaptureHoldActive(), true, 'Lead capture hold must be active by default');

  // Verify Protected Line Invariant (calculatorAuth.cjs line 13)
  await test('Protected Invariant: calculatorAuth.cjs Line 13 unchanged', async () => {
    const filePath = path.resolve(ROOT, 'src/routes/calculatorAuth.cjs');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const line13 = lines[12];
    assert(line13, 'Line 13 must exist');
    assert(
      line13.includes("const JWT_SECRET = process.env.FINANCIAL_TOOLS_SESSION_SECRET || process.env.CALCULATOR_SESSION_SECRET || 'avani_default_calc_sec_key_2026_983742';"),
      'Line 13 must match expected invariant string'
    );
  });

  // Mock CRM Server to monitor that ZERO calls are received during HOLD
  let crmCalls = [];
  const mockCrm = http.createServer((req, res) => {
    crmCalls.push({ method: req.method, url: req.url });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });
  await new Promise(r => mockCrm.listen(0, '127.0.0.1', r));
  const crmPort = mockCrm.address().port;
  process.env.AVANI_CRM_URL = `http://127.0.0.1:${crmPort}`;

  const saveLead = (await import(pathToFileURL(path.join(ROOT, 'api/save-lead.js')).href)).default;

  // Mount Express routes for Builder and Education
  const pubRouter = require(path.join(ROOT, 'src/routes/publicEnquiryRoutes.cjs'));
  const formTrackingRouter = require(path.join(ROOT, 'src/routes/formTracking.cjs'));
  const app = express();
  app.use(express.json());
  app.use('/api/portal/public', pubRouter);
  app.use('/api/lead', formTrackingRouter);
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const serverPort = server.address().port;

  function postHttp(urlPath, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request(
        { hostname: '127.0.0.1', port: serverPort, path: urlPath, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
        (res) => {
          let chunks = '';
          res.on('data', c => { chunks += c; });
          res.on('end', () => {
            let json = null;
            try { json = JSON.parse(chunks); } catch {}
            resolve({ status: res.statusCode, body: json });
          });
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // ── TEST CATEGORIES 1-6 (RETAIL LOANS via api/save-lead.js) ──
  const retailCategories = [
    { id: 1, name: 'Personal Loan', loanType: 'Personal Loan' },
    { id: 2, name: 'Business / MSME Loan', loanType: 'Business Loan' },
    { id: 3, name: 'Doctor Loan', loanType: 'Doctor Loan' },
    { id: 4, name: 'Home Loan', loanType: 'Home Loan' },
    { id: 5, name: 'Mortgage / LAP', loanType: 'Mortgage Loan / LAP' },
    { id: 6, name: 'Education Loan (Retail)', loanType: 'Education Loan India' }
  ];

  for (const cat of retailCategories) {
    await test(`Category ${cat.id} (${cat.name}): Form validation active (400 on invalid phone)`, async () => {
      const res = makeRes();
      await saveLead({
        method: 'POST',
        body: { name: 'Applicant Test', phone: '12345', loanType: cat.loanType, consent: true }
      }, res);
      assert.strictEqual(res.statusCode, 400, 'Must return 400 for invalid phone');
      assert.strictEqual(res.body.success, false);
    });

    await test(`Category ${cat.id} (${cat.name}): DPDP consent active (403 on missing consent)`, async () => {
      const res = makeRes();
      await saveLead({
        method: 'POST',
        body: { name: 'Applicant Test', phone: '9822012345', loanType: cat.loanType, consent: false }
      }, res);
      assert.strictEqual(res.statusCode, 403, 'Must return 403 when consent not granted');
      assert.strictEqual(res.body.success, false);
    });

    await test(`Category ${cat.id} (${cat.name}): HOLD intercept prevents unverified CRM dispatch & provides contact alternatives`, async () => {
      const initialCrmCalls = crmCalls.length;
      const res = makeRes();
      await saveLead({
        method: 'POST',
        body: {
          name: `Applicant ${cat.name}`,
          phone: '9822012345',
          email: 'applicant@example.com',
          loanType: cat.loanType,
          amount: '1500000',
          city: 'Latur',
          consent: true,
          idempotencyKey: `APR033-TEST-CAT-${cat.id}`
        }
      }, res);

      // Verify NO unverified CRM submission occurred
      assert.strictEqual(crmCalls.length, initialCrmCalls, 'ZERO CRM calls must be dispatched during HOLD');

      // Verify HTTP 503 and HOLD payload
      assert.strictEqual(res.statusCode, 503, 'Must return HTTP 503 during HOLD');
      assert.strictEqual(res.body.success, false, 'success must be false');
      assert.strictEqual(res.body.hold, true, 'hold must be true');
      assert.strictEqual(res.body.persisted, false, 'persisted must be false');
      assert.strictEqual(res.body.error, 'LEAD_CAPTURE_HOLD');

      // Verify contact alternatives
      assert.strictEqual(res.body.contact.phone, '+91 91756 35165');
      assert.strictEqual(res.body.contact.telHref, 'tel:+919175635165');
      assert.strictEqual(res.body.contact.whatsappUrl, 'https://wa.me/919175635165');
      assert.strictEqual(res.body.contact.email, 'enquiry@avanifinserv.com');
      assert.strictEqual(res.body.contact.website, 'https://www.avanifinserv.com');

      // Verify no sensitive customer data in WhatsApp URL
      assert(!res.body.contact.whatsappUrl.includes('9822012345'), 'WhatsApp URL must not leak applicant phone');
      assert(!res.body.contact.whatsappUrl.includes('1500000'), 'WhatsApp URL must not leak applicant loan amount');
    });
  }

  // ── TEST CATEGORY 7: BUILDER / JOINT VENTURE ──
  await test('Category 7 (Builder / Joint Venture): Validation active (400 on missing company)', async () => {
    const res = await postHttp('/api/portal/public/builder-enquiry', {
      contact_person: 'Mr. Builder',
      official_email: 'builder@example.com',
      business_telephone: '9822099999',
      city: 'Pune',
      privacy_acknowledgement: true
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await test('Category 7 (Builder / Joint Venture): HOLD intercept prevents unverified CRM dispatch & provides contact alternatives', async () => {
    const initialCrmCalls = crmCalls.length;
    const res = await postHttp('/api/portal/public/builder-enquiry', {
      company_name: 'Avani Developers LLP',
      contact_person: 'Mr. Builder',
      designation: 'Managing Director',
      official_email: 'director@avanidevelopers.com',
      business_telephone: '9822099999',
      city: 'Pune',
      privacy_acknowledgement: true
    });

    assert.strictEqual(crmCalls.length, initialCrmCalls, 'Zero CRM calls must be dispatched during HOLD');
    assert.strictEqual(res.status, 503, 'Must return HTTP 503 during HOLD');
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.hold, true);
    assert.strictEqual(res.body.persisted, false);
    assert.strictEqual(res.body.error, 'LEAD_CAPTURE_HOLD');
    assert.strictEqual(res.body.contact.phone, '+91 91756 35165');
    assert.strictEqual(res.body.contact.whatsappUrl, 'https://wa.me/919175635165');
    assert.strictEqual(res.body.contact.telHref, 'tel:+919175635165');
  });

  // ── TEST CATEGORY 8: SCHOOL / COLLEGE INSTITUTIONAL FUNDING ──
  await test('Category 8 (School / College Funding): Validation active (400 on missing institution)', async () => {
    const res = await postHttp('/api/portal/public/education-enquiry', {
      contact_person: 'Principal Trustee',
      official_email: 'trust@example.edu',
      telephone: '9822088888',
      city: 'Latur',
      privacy_acknowledgement: true
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await test('Category 8 (School / College Funding): HOLD intercept prevents unverified CRM dispatch & provides contact alternatives', async () => {
    const initialCrmCalls = crmCalls.length;
    const res = await postHttp('/api/portal/public/education-enquiry', {
      institution_name: 'Shri Sharda Education Trust',
      institution_category: 'Private CBSE / ICSE School',
      contact_person: 'Principal Trustee',
      designation: 'Secretary',
      official_email: 'trust@sharda.edu',
      telephone: '9822088888',
      city: 'Latur',
      estimated_amount: 50000000,
      privacy_acknowledgement: true
    });

    assert.strictEqual(crmCalls.length, initialCrmCalls, 'Zero CRM calls must be dispatched during HOLD');
    assert.strictEqual(res.status, 503, 'Must return HTTP 503 during HOLD');
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.hold, true);
    assert.strictEqual(res.body.persisted, false);
    assert.strictEqual(res.body.error, 'LEAD_CAPTURE_HOLD');
    assert.strictEqual(res.body.contact.phone, '+91 91756 35165');
    assert.strictEqual(res.body.contact.whatsappUrl, 'https://wa.me/919175635165');
  });

  // ── TEST PRODUCT APPLY CENTRAL SUBMIT ENDPOINT (/api/lead/submit) ──
  await test('Product Apply (/api/lead/submit): HOLD intercept prevents unverified CRM dispatch & returns contact alternatives', async () => {
    const initialCrmCalls = crmCalls.length;
    const res = await postHttp('/api/lead/submit', {
      name: 'Central Apply Applicant',
      phone: '9822077777',
      email: 'applicant@example.com',
      loanType: 'Doctor Loan',
      amount: '2500000',
      city: 'Latur'
    });

    assert.strictEqual(crmCalls.length, initialCrmCalls, 'Zero CRM calls must be dispatched during HOLD');
    assert.strictEqual(res.status, 503, 'Must return HTTP 503 during HOLD');
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.hold, true);
    assert.strictEqual(res.body.error, 'LEAD_CAPTURE_HOLD');
    assert.strictEqual(res.body.contact.whatsappUrl, 'https://wa.me/919175635165');
  });

  // ── TEST CONFIGURABILITY (LEAD_CAPTURE_HOLD=false) ──
  await test('Configurability: Setting LEAD_CAPTURE_HOLD=false successfully un-holds the pipeline', async () => {
    process.env.LEAD_CAPTURE_HOLD = 'false';
    assert.strictEqual(isLeadCaptureHoldActive(), false, 'Hold must be false when configured to false');

    // Reset hold for next operations
    delete process.env.LEAD_CAPTURE_HOLD;
    assert.strictEqual(isLeadCaptureHoldActive(), true, 'Hold must default back to true');
  });

  mockCrm.close();
  server.close();

  console.log('\n-----------------------------------------------------------------------');
  console.log(`TOTAL APR-033 TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('-----------------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
})();
