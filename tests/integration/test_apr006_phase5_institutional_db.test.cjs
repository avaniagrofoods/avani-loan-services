/**
 * APR-006 Phase 5 — Institutional Database (Project D) Mounted Express Verification Suite
 * Uses an in-memory clone of the canonical 80-record education_* JSON dataset (ZERO disk mutation).
 * Verifies APR006-P5-01 through APR006-P5-05 end-to-end.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const ExcelJS = require('exceljs');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'AVANI_LOAN_SERVICES_UNIFIED_PORTAL', 'data');

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

function createInMemoryEducationDb() {
  const load = (name) => {
    const fp = path.join(DATA_DIR, `${name}.json`);
    return fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : [];
  };
  const pkMap = {
    education_institutions: 'institution_id',
    education_contacts: 'contact_id',
    education_funding_profiles: 'profile_id',
    education_pipeline: 'deal_id',
    education_consent_records: 'consent_id'
  };
  const tables = {};
  for (const [tbl, pk] of Object.entries(pkMap)) {
    tables[tbl] = new Map();
    for (const row of load(tbl)) {
      if (row && row[pk]) tables[tbl].set(row[pk], { ...row });
    }
  }
  const auditLogs = [];
  const accessedTables = new Set();

  return {
    tables,
    auditLogs,
    accessedTables,
    getAll(table) {
      accessedTables.add(table);
      return tables[table] ? Array.from(tables[table].values()) : [];
    },
    getById(table, id) {
      accessedTables.add(table);
      return tables[table] ? tables[table].get(id) : undefined;
    },
    find(table, pred) {
      return this.getAll(table).filter(pred);
    },
    findOne(table, pred) {
      return this.getAll(table).find(pred);
    },
    upsert(table, pk, record) {
      accessedTables.add(table);
      if (!tables[table]) tables[table] = new Map();
      tables[table].set(record[pk], { ...record });
      return tables[table].get(record[pk]);
    },
    async upsertAsync(table, pk, record) {
      return this.upsert(table, pk, record);
    },
    logAudit(userId, moduleName, action, details, ip) {
      auditLogs.push({ userId, moduleName, action, details, ip });
    }
  };
}

function httpRequest(port, method, urlPath, bodyObj = null) {
  return new Promise((resolve, reject) => {
    const payload = bodyObj ? JSON.stringify(bodyObj) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
          : {}
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          let json = null;
          try { json = JSON.parse(buf.toString('utf8')); } catch {}
          resolve({ status: res.statusCode, headers: res.headers, buffer: buf, json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  const mockDb = createInMemoryEducationDb();

  // Override one in-memory canonical school record (in SCHOOL_IDS) with sparse funding fields + formula-injection name (ZERO disk mutation!)
  mockDb.upsert('education_institutions', 'institution_id', {
    institution_id: 'ALS-EDU-MH-MUM-003',
    institution_name: '=HYPERLINK("http://evil.example","Synthetic Sparse School")',
    institution_category: 'K-12 School',
    parent_trust_society: '+FORMULA_TRUST',
    city: 'Latur',
    state: 'Maharashtra',
    lead_priority_tier: 'A+',
    verification_status: 'Unverified_Pending'
  });
  mockDb.upsert('education_institutions', 'institution_id', {
    institution_id: 'ALS-EDU-SYNTH-COL',
    institution_name: '@SUM(1,2) Synthetic Sparse College',
    institution_category: 'Engineering College',
    city: 'Pune',
    state: null, // tests null-safe /aplus filtering!
    ownership_type: null,
    lead_priority_tier: 'A+',
    verification_status: 'Unverified_Pending'
  });

  const dbModulePath = require.resolve('../../src/models/portalDatabase.cjs');
  const authModulePath = require.resolve('../../src/middleware/portalAuthMiddleware.cjs');
  const routerModulePath = require.resolve('../../src/routes/educationPortalRoutes.cjs');

  require.cache[dbModulePath] = { id: dbModulePath, filename: dbModulePath, loaded: true, exports: mockDb };
  require.cache[authModulePath] = {
    id: authModulePath,
    filename: authModulePath,
    loaded: true,
    exports: {
      requirePortalAuth: (req, _res, next) => { req.portalUser = { userId: 'TEST-ADMIN-01', role: 'SUPER_ADMIN' }; next(); },
      requirePermission: () => (_req, _res, next) => next()
    }
  };
  delete require.cache[routerModulePath];

  const educationRouter = require('../../src/routes/educationPortalRoutes.cjs');
  const app = express();
  app.use(express.json());
  app.use('/api/portal/education', educationRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // T01: Zero fabricated borrowing capacity / clear title defaults on /schools and /colleges (APR006-P5-01)
    await runTest('T01: /schools and /colleges never fabricate ₹5 Cr - ₹10 Cr or Clear Land Title defaults', async () => {
      const schRes = await httpRequest(port, 'GET', '/api/portal/education/schools?search=ALS-EDU-MH-MUM-003');
      assert.strictEqual(schRes.status, 200);
      assert.strictEqual(schRes.json.is_estimate_not_revenue, true);
      assert.ok(/NOT an approved loan/i.test(schRes.json.funding_estimate_disclaimer));
      const sch = schRes.json.data[0];
      assert.ok(sch, 'Synthetic sparse school not found in /schools');
      assert.strictEqual(sch.potential_borrowing_capacity, 'Unassessed — Estimate Pending');
      assert.strictEqual(sch.property_ownership_evidence, '');
      assert.strictEqual(sch.secured_lap_potential, '');
      assert.strictEqual(sch.unsecured_od_potential, '');
      assert.strictEqual(sch.is_estimate_not_revenue, true);

      const colRes = await httpRequest(port, 'GET', '/api/portal/education/colleges?search=ALS-EDU-SYNTH-COL');
      assert.strictEqual(colRes.status, 200);
      assert.strictEqual(colRes.json.is_estimate_not_revenue, true);
      const col = colRes.json.data[0];
      assert.ok(col, 'Synthetic college not found in /colleges');
      assert.strictEqual(col.potential_borrowing_capacity, 'Unassessed — Estimate Pending');
      assert.strictEqual(col.property_ownership_evidence, '');
    });

    // T02: /aplus is null-safe and computes Secured/Unsecured counts from real data (NO Math.floor * 0.45) (APR006-P5-02)
    await runTest('T02: /aplus handles null fields safely and computes real Secured/Unsecured counts without fabricated multiplier', async () => {
      const src = fs.readFileSync(path.join(ROOT, 'src', 'routes', 'educationPortalRoutes.cjs'), 'utf8');
      assert.ok(!src.includes('aPlus.length * 0.45'), 'Fabricated 0.45 multiplier still present in source');

      const aplusRes = await httpRequest(port, 'GET', '/api/portal/education/aplus?segment=mh_school');
      assert.strictEqual(aplusRes.status, 200);
      assert.strictEqual(aplusRes.json.is_estimate_not_revenue, true);
      assert.ok(aplusRes.json.segments['A+ Secured Funding'] < aplusRes.json.totalAPlus, 'Sparse unassessed records must not inflate A+ Secured Funding');
      assert.ok(typeof aplusRes.json.segments['A+ Unsecured Funding'] === 'number');
    });

    // T03: Allowlist on POST/PUT /institutions + duplicate 409 + verification_status validation (APR006-P5-03)
    await runTest('T03: POST/PUT /institutions blocks mass-assignment, enforces Unverified_Pending & provenance, rejects duplicate 409', async () => {
      const createRes = await httpRequest(port, 'POST', '/api/portal/education/institutions', {
        institution_name: 'Synthetic New Academy',
        institution_category: 'K-12 School',
        city: 'Latur',
        verification_status: 'Verified', // must be overridden
        qualification_score: 999,        // stripped
        isAdmin: true,                   // stripped
        pipeline_stage: 21               // forced to 1
      });
      assert.strictEqual(createRes.status, 201);
      assert.strictEqual(createRes.json.data.verification_status, 'Unverified_Pending');
      assert.strictEqual(createRes.json.data.pipeline_stage, 1);
      assert.strictEqual(createRes.json.data.isAdmin, undefined);
      assert.strictEqual(createRes.json.data.qualification_score, undefined);
      assert.ok(createRes.json.data.source_dataset);
      assert.ok(createRes.json.data.import_batch_id);

      const dupRes = await httpRequest(port, 'POST', '/api/portal/education/institutions', {
        institution_name: 'Synthetic New Academy',
        institution_category: 'K-12 School',
        city: 'Latur'
      });
      assert.strictEqual(dupRes.status, 409);

      const id = createRes.json.data.institution_id;
      const badPut = await httpRequest(port, 'PUT', `/api/portal/education/institutions/${id}`, {
        verification_status: 'FAKE_STATUS'
      });
      assert.strictEqual(badPut.status, 400);

      const okPut = await httpRequest(port, 'PUT', `/api/portal/education/institutions/${id}`, {
        strategic_remarks: 'Synthetic note',
        isAdmin: true
      });
      assert.strictEqual(okPut.status, 200);
      assert.strictEqual(okPut.json.data.strategic_remarks, 'Synthetic note');
      assert.strictEqual(okPut.json.data.isAdmin, undefined);
    });

    // T04: GET /pipeline summary & strict stage/amount validation (APR006-P5-03 & APR006-P5-05)
    await runTest('T04: GET /pipeline separates estimates from revenue & PUT /pipeline/:dealId/stage enforces strict validation', async () => {
      const pipeRes = await httpRequest(port, 'GET', '/api/portal/education/pipeline');
      assert.strictEqual(pipeRes.status, 200);
      const summary = pipeRes.json.pipeline_summary;
      assert.ok(summary, 'Missing pipeline_summary');
      assert.strictEqual(summary.is_estimate_not_revenue, true);
      assert.strictEqual(summary.confirmed_sanctioned_deals, 0, 'Canonical dataset has 0 sanctioned deals');
      assert.strictEqual(summary.confirmed_disbursed_deals, 0, 'Canonical dataset has 0 disbursed deals');
      assert.ok(summary.preliminary_estimated_pipeline_inr > 0);

      const firstDeal = mockDb.getAll('education_pipeline')[0];
      // Invalid stages
      for (const bad of [0, -1, 25, 999, 'abc']) {
        const r = await httpRequest(port, 'PUT', `/api/portal/education/pipeline/${firstDeal.deal_id}/stage`, { stage: bad });
        assert.strictEqual(r.status, 400, `Expected 400 for stage=${bad}`);
      }
      // Negative sanctioned amount
      const negRes = await httpRequest(port, 'PUT', `/api/portal/education/pipeline/${firstDeal.deal_id}/stage`, { stage: 19, lender_name: 'SBI', sanctioned_amount: -100 });
      assert.strictEqual(negRes.status, 400);
      // Premature sanctioned amount on Stage 10
      const preRes = await httpRequest(port, 'PUT', `/api/portal/education/pipeline/${firstDeal.deal_id}/stage`, { stage: 10, sanctioned_amount: 5000000 });
      assert.strictEqual(preRes.status, 400);
      // Stage 19 without verified lender
      const noLender = await httpRequest(port, 'PUT', `/api/portal/education/pipeline/${firstDeal.deal_id}/stage`, { stage: 19, lender_name: 'Pending Lender Matching' });
      assert.strictEqual(noLender.status, 400);
    });

    // T05: PUT /consent/:id validates consent_status enum & cadence_step (APR006-P5-03)
    await runTest('T05: PUT /consent/:id strictly validates consent_status enum and non-negative cadence_step', async () => {
      const firstConsent = mockDb.getAll('education_consent_records')[0];
      const badConsent = await httpRequest(port, 'PUT', `/api/portal/education/consent/${firstConsent.consent_id}`, {
        consent_status: 'ARBITRARY_STATUS'
      });
      assert.strictEqual(badConsent.status, 400);

      const badCadence = await httpRequest(port, 'PUT', `/api/portal/education/consent/${firstConsent.consent_id}`, {
        consent_status: 'Opted_Out',
        cadence_step: -2
      });
      assert.strictEqual(badCadence.status, 400);

      const okConsent = await httpRequest(port, 'PUT', `/api/portal/education/consent/${firstConsent.consent_id}`, {
        consent_status: 'Revoked',
        suppression_reason: 'Synthetic opt-out test',
        cadence_step: 0
      });
      assert.strictEqual(okConsent.status, 200);
      assert.strictEqual(okConsent.json.data.consent_status, 'Revoked');
    });

    // T06: All 3 Excel exports escape formula injection (APR006-P5-04)
    await runTest('T06: /schools/export, /colleges/export, and /export escape Excel formula injection', async () => {
      const checks = [
        { url: '/api/portal/education/schools/export', sheet: 'School Funding Database', targetId: 'ALS-EDU-MH-MUM-003', expectedPrefix: "'=" },
        { url: '/api/portal/education/colleges/export', sheet: 'College & University Database', targetId: 'ALS-EDU-SYNTH-COL', expectedPrefix: "'@" },
        { url: '/api/portal/education/export', sheet: 'Education Institutions', targetId: 'ALS-EDU-MH-MUM-003', expectedPrefix: "'=" }
      ];
      for (const chk of checks) {
        const res = await httpRequest(port, 'GET', chk.url);
        assert.strictEqual(res.status, 200, `${chk.url} returned ${res.status}`);
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(res.buffer);
        const ws = wb.getWorksheet(chk.sheet);
        assert.ok(ws, `Worksheet missing: ${chk.sheet}`);
        let matched = false;
        ws.eachRow((row, rowNum) => {
          if (rowNum === 1) return;
          if (String(row.getCell(1).value || '') === chk.targetId) {
            matched = true;
            const instName = String(row.getCell(2).value || '');
            assert.ok(instName.startsWith(chk.expectedPrefix), `${chk.url}: unescaped formula in name: ${instName}`);
          }
        });
        assert.strictEqual(matched, true, `${chk.url}: synthetic formula row not found`);
      }
    });

    // T07: Strict table isolation — exclusively education_* tables
    await runTest('T07: Institutional routes interact exclusively with education_* tables (zero CRM/builder writes)', () => {
      for (const tbl of mockDb.accessedTables) {
        assert.ok(tbl.startsWith('education_'), `Unexpected non-education table accessed: ${tbl}`);
      }
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\nAPR-006 Phase 5 Institutional DB Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
