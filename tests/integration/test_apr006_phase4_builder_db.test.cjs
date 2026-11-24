/**
 * APR-006 Phase 4 — Builder Database (Project C) Mounted Express Verification Suite
 * Uses an in-memory clone of the canonical 80-record builder_* JSON dataset (ZERO disk mutation).
 * Verifies APR006-P4-01 through APR006-P4-05 end-to-end.
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

function createInMemoryPortalDb() {
  const load = (name) => {
    const fp = path.join(DATA_DIR, `${name}.json`);
    return fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : [];
  };
  const pkMap = {
    builder_companies: 'builder_id',
    builder_contacts: 'contact_id',
    builder_maharera: 'rera_id',
    builder_pipeline: 'deal_id',
    builder_activities: 'activity_id'
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
  const mockDb = createInMemoryPortalDb();

  // Inject synthetic unverified builder + unverified Director contact + formula-injection test record into IN-MEMORY clone only
  mockDb.upsert('builder_companies', 'builder_id', {
    builder_id: 'ALS-BLD-SYNTH-UNVER',
    company_name: '=HYPERLINK("http://evil.example","Synthetic Unverified Developers")',
    brand_name: '+CMD_TEST',
    city: 'Latur',
    state: 'Maharashtra',
    verification_status: 'Unverified_Pending',
    decision_maker_name: 'Unverified Spoofed Executive',
    executive_designation: 'Managing Director',
    qualification_score: 0
  });
  mockDb.upsert('builder_contacts', 'contact_id', {
    contact_id: 'ALS-BCON-SYNTH-UNVER',
    builder_id: 'ALS-BLD-SYNTH-UNVER',
    full_name: 'Unverified Director Contact',
    designation: 'Managing Director & CEO',
    dm_class: 'DECISION-MAKER NOT VERIFIED',
    verification_status: 'Unverified_Pending'
  });

  // Inject synthetic verified builder with verified contact using ONLY full_name (no company.decision_maker_name)
  mockDb.upsert('builder_companies', 'builder_id', {
    builder_id: 'ALS-BLD-SYNTH-VER',
    company_name: 'Synthetic Verified Realty Pvt Ltd',
    city: 'Pune',
    state: 'Maharashtra',
    verification_status: 'Verified',
    qualification_score: 88
  });
  mockDb.upsert('builder_contacts', 'contact_id', {
    contact_id: 'ALS-BCON-SYNTH-VER',
    builder_id: 'ALS-BLD-SYNTH-VER',
    full_name: 'Verified Contact Full Name',
    designation: 'Managing Director',
    dm_class: 'VERIFIED DECISION-MAKER',
    verification_status: 'Verified'
  });
  mockDb.upsert('builder_maharera', 'rera_id', {
    rera_id: 'ALS-BRERA-SYNTH-VER',
    builder_id: 'ALS-BLD-SYNTH-VER',
    registration_number: 'P52100099999'
  });

  // Stub portalDatabase.cjs and portalAuthMiddleware.cjs in require.cache before loading router
  const dbModulePath = require.resolve('../../src/models/portalDatabase.cjs');
  const authModulePath = require.resolve('../../src/middleware/portalAuthMiddleware.cjs');
  const routerModulePath = require.resolve('../../src/routes/builderPortalRoutes.cjs');

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

  const builderRouter = require('../../src/routes/builderPortalRoutes.cjs');
  const app = express();
  app.use(express.json());
  app.use('/api/portal/builder', builderRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // T01: Unverified Director contact MUST NOT be treated as a valid decision-maker (APR006-P4-01)
    await runTest('T01: Unverified Director contact is excluded from decisionMakers and decision_makers subview', async () => {
      const res = await httpRequest(port, 'GET', '/api/portal/builder/companies?subview=decision_makers&limit=200');
      assert.strictEqual(res.status, 200);
      const ids = res.json.data.map((b) => b.builder_id);
      assert.strictEqual(ids.includes('ALS-BLD-SYNTH-UNVER'), false, 'Unverified builder leaked into decision_makers subview');
      assert.strictEqual(ids.includes('ALS-BLD-SYNTH-VER'), true, 'Verified builder missing from decision_makers subview');

      const allRes = await httpRequest(port, 'GET', '/api/portal/builder/companies?search=ALS-BLD-SYNTH-UNVER');
      assert.strictEqual(allRes.status, 200);
      const unver = allRes.json.data[0];
      assert.strictEqual(unver.decisionMakers.length, 0, 'Unverified contact must not appear in decisionMakers');
      assert.strictEqual(unver.key_decision_maker_name, '', 'Unverified builder must not expose key_decision_maker_name');
      assert.strictEqual(unver.decision_maker_verified, false);
      assert.strictEqual(unver.unverifiedContactsCount, 1);
    });

    // T02: Verified contact resolves canonical full_name (APR006-P4-02)
    await runTest('T02: Verified contact resolves canonical full_name on GET /companies', async () => {
      const res = await httpRequest(port, 'GET', '/api/portal/builder/companies?search=ALS-BLD-SYNTH-VER');
      assert.strictEqual(res.status, 200);
      const rec = res.json.data[0];
      assert.strictEqual(rec.key_decision_maker_name, 'Verified Contact Full Name');
      assert.strictEqual(rec.decision_maker_verified, true);
      assert.strictEqual(rec.verifiedContactsCount, 1);
    });

    // T03: POST /companies blocks mass-assignment, forces Unverified_Pending, sets provenance, rejects duplicate 409 (APR006-P4-03/05)
    await runTest('T03: POST /companies blocks mass-assignment, enforces Unverified_Pending & provenance, rejects duplicate 409', async () => {
      const createRes = await httpRequest(port, 'POST', '/api/portal/builder/companies', {
        company_name: 'Synthetic New Builder Co',
        city: 'Latur',
        verification_status: 'Verified', // must be ignored/overridden
        qualification_score: 999,        // must be stripped by allowlist
        isAdmin: true,                   // must be stripped by allowlist
        pipeline_stage: 16               // must be forced to 1
      });
      assert.strictEqual(createRes.status, 201);
      assert.strictEqual(createRes.json.data.verification_status, 'Unverified_Pending');
      assert.strictEqual(createRes.json.data.pipeline_stage, 1);
      assert.strictEqual(createRes.json.data.isAdmin, undefined);
      assert.strictEqual(createRes.json.data.qualification_score, undefined);
      assert.ok(createRes.json.data.source_dataset, 'Missing source_dataset provenance');
      assert.ok(createRes.json.data.import_batch_id, 'Missing import_batch_id provenance');

      // Duplicate rejection
      const dupRes = await httpRequest(port, 'POST', '/api/portal/builder/companies', {
        company_name: 'Synthetic New Builder Co',
        city: 'Latur'
      });
      assert.strictEqual(dupRes.status, 409);

      // PUT mass-assignment & invalid verification_status rejection
      const id = createRes.json.data.builder_id;
      const badStatus = await httpRequest(port, 'PUT', `/api/portal/builder/companies/${id}`, {
        verification_status: 'SPOOFED_STATUS'
      });
      assert.strictEqual(badStatus.status, 400);

      const goodPut = await httpRequest(port, 'PUT', `/api/portal/builder/companies/${id}`, {
        notes: 'Verified note',
        isAdmin: true,
        qualification_score: 999
      });
      assert.strictEqual(goodPut.status, 200);
      assert.strictEqual(goodPut.json.data.notes, 'Verified note');
      assert.strictEqual(goodPut.json.data.isAdmin, undefined);
      assert.strictEqual(goodPut.json.data.qualification_score, undefined);
    });

    // T04: Bounded pagination & strict pipeline stage 1..19 validation (APR006-P4-03)
    await runTest('T04: Bounded pagination & PUT /pipeline/:dealId/stage rejects invalid/out-of-range stages', async () => {
      const pageRes = await httpRequest(port, 'GET', '/api/portal/builder/companies?page=-5&limit=99999');
      assert.strictEqual(pageRes.status, 200);
      assert.strictEqual(pageRes.json.page, 1);
      assert.strictEqual(pageRes.json.limit, 200);

      const firstDeal = mockDb.getAll('builder_pipeline')[0];
      assert.ok(firstDeal, 'Expected at least 1 builder pipeline deal');

      for (const badStage of [0, -1, 20, 999, 'abc', null, 1.5]) {
        const badRes = await httpRequest(port, 'PUT', `/api/portal/builder/pipeline/${firstDeal.deal_id}/stage`, { stage: badStage });
        assert.strictEqual(badRes.status, 400, `Expected 400 for stage=${badStage}, got ${badRes.status}`);
      }

      const okRes = await httpRequest(port, 'PUT', `/api/portal/builder/pipeline/${firstDeal.deal_id}/stage`, { stage: 10, notes: 'Synthetic test' });
      assert.strictEqual(okRes.status, 200);
      assert.strictEqual(okRes.json.data.stage, 10);
    });

    // T05: GET /export escapes Excel formulas and joins MahaRERA + verified DM (APR006-P4-04)
    await runTest('T05: GET /export escapes formula injection and joins builder_maharera + verified DM', async () => {
      const expRes = await httpRequest(port, 'GET', '/api/portal/builder/export');
      assert.strictEqual(expRes.status, 200);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(expRes.buffer);
      const ws = wb.getWorksheet('Maharashtra Builders');
      assert.ok(ws, 'Missing Maharashtra Builders worksheet');

      let foundFormulaRow = false;
      let foundVerifiedRow = false;
      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        const id = String(row.getCell(1).value || '');
        const companyName = String(row.getCell(2).value || '');
        const brandName = String(row.getCell(3).value || '');
        const dmName = String(row.getCell(5).value || '');
        const reraNums = String(row.getCell(14).value || '');

        if (id === 'ALS-BLD-SYNTH-UNVER') {
          foundFormulaRow = true;
          assert.ok(companyName.startsWith("'="), `Formula injection not escaped in company_name: ${companyName}`);
          assert.ok(brandName.startsWith("'+"), `Formula injection not escaped in brand_name: ${brandName}`);
          assert.strictEqual(dmName, '', 'Unverified DM must not be exported');
        }
        if (id === 'ALS-BLD-SYNTH-VER') {
          foundVerifiedRow = true;
          assert.strictEqual(dmName, 'Verified Contact Full Name', 'Verified DM full_name not joined in export');
          assert.ok(reraNums.includes('P52100099999'), `MahaRERA registration not joined in export: ${reraNums}`);
        }
      });

      assert.strictEqual(foundFormulaRow, true, 'Synthetic formula row missing from export');
      assert.strictEqual(foundVerifiedRow, true, 'Synthetic verified row missing from export');
    });

    // T06: Strict table isolation — zero CRM customer or education table access
    await runTest('T06: Builder routes interact exclusively with builder_* tables (zero CRM/education table writes)', () => {
      for (const tbl of mockDb.accessedTables) {
        assert.ok(tbl.startsWith('builder_'), `Unexpected non-builder table accessed: ${tbl}`);
      }
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\nAPR-006 Phase 4 Builder DB Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
