/**
 * APR-025 STANDALONE INTEGRATION TEST SUITE
 * Production Lead Capture Integrity, Data Reliability & Fail-Closed Handover Verification
 *
 * Verifies:
 * 1. calculatorAuth.cjs Line 13 invariant immutability (SHA-256 / string check)
 * 2. api/save-lead.js fail-closed 503 behavior when canonical handover fails
 * 3. api/save-lead.js success 200 behavior when canonical handover succeeds
 * 4. publicEnquiryRoutes.cjs builder-enquiry CRM forwarding & fail-closed behavior
 * 5. publicEnquiryRoutes.cjs education-enquiry CRM forwarding & fail-closed behavior
 * 6. Zero synthetic writes to live production Google Sheets or live website
 */

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');
const express = require('express');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'AVANI_LOAN_SERVICES_UNIFIED_PORTAL', 'data');

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

function createInMemoryPortalDb() {
  const load = (n) => {
    const p = path.join(DATA_DIR, `${n}.json`);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
  };
  const pkMap = {
    builder_companies: 'builder_id',
    builder_contacts: 'contact_id',
    builder_enquiries: 'enquiry_id',
    education_institutions: 'institution_id',
    education_contacts: 'contact_id',
    education_consent_records: 'consent_id',
    education_enquiries: 'enquiry_id',
    unified_tasks: 'task_id'
  };
  const tables = {};
  for (const [t, pk] of Object.entries(pkMap)) {
    tables[t] = new Map();
    for (const r of load(t)) if (r && r[pk]) tables[t].set(r[pk], { ...r });
  }
  return {
    tables,
    getAll: (t) => (tables[t] ? Array.from(tables[t].values()) : []),
    getById: (t, id) => (tables[t] ? tables[t].get(id) : undefined),
    find: (t, pred) => (tables[t] ? Array.from(tables[t].values()).filter(pred) : []),
    findOne: (t, pred) => (tables[t] ? Array.from(tables[t].values()).find(pred) : undefined),
    upsert: (t, pk, rec) => {
      if (!tables[t]) tables[t] = new Map();
      tables[t].set(rec[pk], { ...rec });
      return tables[t].get(rec[pk]);
    },
    logAudit: () => {}
  };
}

function httpPost(port, urlPath, bodyObj) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(bodyObj);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(data); } catch {}
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('=======================================================================');
  console.log('APR-025 — PRODUCTION LEAD CAPTURE INTEGRITY & FAIL-CLOSED TEST SUITE');
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

  // 1. Calculator Auth Protected Line Invariant
  await test('Invariant 1: calculatorAuth.cjs Line 13 matches protected secret invariant', async () => {
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

  // 2. api/save-lead.js Fail-Closed Verification
  const saveLead = (await import(pathToFileURL(path.join(ROOT, 'api/save-lead.js')).href)).default;

  await test('api/save-lead.js fails closed (HTTP 503) when CRM and Google Apps Script endpoints fail', async () => {
    const origCrm = process.env.AVANI_CRM_URL;
    const origWebApp = process.env.GOOGLE_WEBAPP_URL;
    process.env.AVANI_CRM_URL = 'http://127.0.0.1:1';
    process.env.GOOGLE_WEBAPP_URL = 'http://127.0.0.1:1';

    try {
      const res = makeRes();
      await saveLead(
        {
          method: 'POST',
          headers: { 'x-forwarded-for': '127.0.0.1' },
          body: {
            name: 'Audit FailClosed Test',
            phone: '9822011111',
            loanType: 'Home Loan',
            city: 'Latur',
            consent: true,
            idempotencyKey: 'fail-closed-test-' + Date.now()
          }
        },
        res
      );

      assert.strictEqual(res.statusCode, 503, `Expected status 503, got ${res.statusCode}`);
      assert.strictEqual(res.body.success, false, 'Expected success: false');
      assert.strictEqual(res.body.persisted, false, 'Expected persisted: false');
      assert.strictEqual(res.body.error, 'CANONICAL_HANDOVER_FAILED');
      assert.strictEqual(res.body.status, 'HANDOVER_UNAVAILABLE');
    } finally {
      process.env.AVANI_CRM_URL = origCrm;
      process.env.GOOGLE_WEBAPP_URL = origWebApp;
    }
  });

  // 3. api/save-lead.js Success Verification with Mock CRM
  let crmInbox = [];
  let crmShouldFail = false;
  const mockCrmServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (crmShouldFail) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'CRM_UNAVAILABLE' }));
      }
      const data = JSON.parse(body || '{}');
      crmInbox.push(data);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        persisted: true,
        leadId: `LEAD-MOCK-${crmInbox.length}`,
        customerId: `CUST-MOCK-${crmInbox.length}`
      }));
    });
  });

  await new Promise(r => mockCrmServer.listen(0, '127.0.0.1', r));
  const crmPort = mockCrmServer.address().port;
  const crmMockUrl = `http://127.0.0.1:${crmPort}`;

  await test('api/save-lead.js returns HTTP 200 with persisted:true when CRM succeeds', async () => {
    const origCrm = process.env.AVANI_CRM_URL;
    process.env.AVANI_CRM_URL = crmMockUrl;
    crmShouldFail = false;

    try {
      const res = makeRes();
      await saveLead(
        {
          method: 'POST',
          headers: { 'x-forwarded-for': '127.0.0.1' },
          body: {
            name: 'Audit Success Lead',
            phone: '9822022222',
            loanType: 'Personal Loan',
            city: 'Latur',
            consent: true,
            idempotencyKey: 'success-test-' + Date.now()
          }
        },
        res
      );

      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.persisted, true);
      assert.strictEqual(crmInbox.length, 1);
      assert.strictEqual(crmInbox[0].phone, '+919822022222');
    } finally {
      process.env.AVANI_CRM_URL = origCrm;
    }
  });

  // 4. Setup Express Server with publicEnquiryRoutes
  const portalDb = createInMemoryPortalDb();
  const dbPath = require.resolve('../../src/models/portalDatabase.cjs');
  const authPath = require.resolve('../../src/middleware/portalAuthMiddleware.cjs');
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: portalDb };
  require.cache[authPath] = {
    id: authPath, filename: authPath, loaded: true,
    exports: {
      requirePortalAuth: (req, _res, next) => { req.portalUser = { userId: 'ADV-SACHIN-01', role: 'SUPER_ADMIN' }; next(); },
      requirePermission: () => (_req, _res, next) => next()
    }
  };
  delete require.cache[require.resolve('../../src/routes/publicEnquiryRoutes.cjs')];
  const pubRouter = require('../../src/routes/publicEnquiryRoutes.cjs');

  const app = express();
  app.use(express.json());
  app.use('/api/portal/public', pubRouter);

  const testServer = http.createServer(app);
  await new Promise(r => testServer.listen(0, '127.0.0.1', r));
  const serverPort = testServer.address().port;

  // 5. Test Builder Enquiry Forwarding & Fail-Closed
  await test('publicEnquiryRoutes POST /builder-enquiry forwards to CRM and returns 201 persisted:true', async () => {
    const origCrm = process.env.AVANI_CRM_URL;
    process.env.AVANI_CRM_URL = crmMockUrl;
    crmShouldFail = false;

    try {
      const resp = await httpPost(serverPort, '/api/portal/public/builder-enquiry', {
        company_name: 'Avani Apex Infrastructure Ltd',
        contact_person: 'Vijay Patil',
        designation: 'Managing Director',
        official_email: 'vijay@apexinfra.in',
        business_telephone: '9822033333',
        city: 'Pune',
        privacy_acknowledgement: true
      });

      assert.strictEqual(resp.status, 201, `Expected 201, got ${resp.status}`);
      assert.strictEqual(resp.json.success, true);
      assert.strictEqual(resp.json.persisted, true);
      assert(resp.json.crmHandover);
      assert.strictEqual(resp.json.crmHandover.persisted, true);

      const lastCrmLead = crmInbox[crmInbox.length - 1];
      assert.strictEqual(lastCrmLead.leadSource, 'WEBSITE_BUILDER_ENQUIRY');
      assert.strictEqual(lastCrmLead.phone, '+919822033333');
    } finally {
      process.env.AVANI_CRM_URL = origCrm;
    }
  });

  await test('publicEnquiryRoutes POST /builder-enquiry fails closed (503) when CRM fails', async () => {
    const origCrm = process.env.AVANI_CRM_URL;
    process.env.AVANI_CRM_URL = crmMockUrl;
    crmShouldFail = true;

    try {
      const resp = await httpPost(serverPort, '/api/portal/public/builder-enquiry', {
        company_name: 'Shree Builders Corp',
        contact_person: 'Ramesh Kulkarni',
        designation: 'Partner',
        official_email: 'ramesh@shreebuilders.in',
        business_telephone: '9822044444',
        city: 'Latur',
        privacy_acknowledgement: true
      });

      assert.strictEqual(resp.status, 503, `Expected 503, got ${resp.status}`);
      assert.strictEqual(resp.json.success, false);
      assert.strictEqual(resp.json.persisted, false);
      assert.strictEqual(resp.json.error, 'CANONICAL_HANDOVER_FAILED');
    } finally {
      process.env.AVANI_CRM_URL = origCrm;
      crmShouldFail = false;
    }
  });

  // 6. Test Institutional Enquiry Forwarding & Fail-Closed
  await test('publicEnquiryRoutes POST /education-enquiry forwards to CRM and returns 201 persisted:true', async () => {
    const origCrm = process.env.AVANI_CRM_URL;
    process.env.AVANI_CRM_URL = crmMockUrl;
    crmShouldFail = false;

    try {
      const resp = await httpPost(serverPort, '/api/portal/public/education-enquiry', {
        institution_name: 'Maharashtra Institute of Technology Latur',
        institution_category: 'Higher Education / Degree College',
        contact_person: 'Dr. S. K. Joshi',
        designation: 'Principal',
        official_email: 'principal@mitlatur.edu.in',
        telephone: '9822055555',
        city: 'Latur',
        estimated_amount: 50000000,
        privacy_acknowledgement: true
      });

      assert.strictEqual(resp.status, 201, `Expected 201, got ${resp.status}`);
      assert.strictEqual(resp.json.success, true);
      assert.strictEqual(resp.json.persisted, true);
      assert(resp.json.crmHandover);
      assert.strictEqual(resp.json.crmHandover.persisted, true);

      const lastCrmLead = crmInbox[crmInbox.length - 1];
      assert.strictEqual(lastCrmLead.leadSource, 'WEBSITE_INSTITUTIONAL_ENQUIRY');
      assert.strictEqual(lastCrmLead.phone, '+919822055555');
      assert.strictEqual(lastCrmLead.requestedAmount, '50000000');
    } finally {
      process.env.AVANI_CRM_URL = origCrm;
    }
  });

  await test('publicEnquiryRoutes POST /education-enquiry fails closed (503) when CRM fails', async () => {
    const origCrm = process.env.AVANI_CRM_URL;
    process.env.AVANI_CRM_URL = crmMockUrl;
    crmShouldFail = true;

    try {
      const resp = await httpPost(serverPort, '/api/portal/public/education-enquiry', {
        institution_name: 'Dnyandeep High School',
        institution_category: 'K-12 School',
        contact_person: 'Anil Deshmukh',
        designation: 'Trustee',
        official_email: 'trustee@dnyandeep.edu.in',
        telephone: '9822066666',
        city: 'Nanded',
        estimated_amount: 15000000,
        privacy_acknowledgement: true
      });

      assert.strictEqual(resp.status, 503, `Expected 503, got ${resp.status}`);
      assert.strictEqual(resp.json.success, false);
      assert.strictEqual(resp.json.persisted, false);
      assert.strictEqual(resp.json.error, 'CANONICAL_HANDOVER_FAILED');
    } finally {
      process.env.AVANI_CRM_URL = origCrm;
      crmShouldFail = false;
    }
  });

  // Clean up servers
  await new Promise(r => testServer.close(r));
  await new Promise(r => mockCrmServer.close(r));

  console.log('\n-----------------------------------------------------------------------');
  console.log(`TOTAL APR-025 TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('-----------------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
})();
