// src/routes/builderPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MODULE A: BUILDER PARTNERSHIP API ROUTES
// Absolute Data Separation: Only interacts with builder_* tables
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission } = require('../middleware/portalAuthMiddleware.cjs');
const ExcelJS = require('exceljs');

// ─────────────────────────────────────────────────────────────────────────────
// APR-006 Phase 4 Hardening Helpers (Verification, Allowlist, Pagination, Excel Safety)
// ─────────────────────────────────────────────────────────────────────────────
const DM_KEYWORDS = ['director', 'managing', 'md', 'ceo', 'promoter', 'founder', 'partner', 'chairman', 'head', 'president', 'executive'];

const VALID_VERIFICATION_STATUSES = new Set(['Verified', 'Unverified_Pending', 'Needs_Review', 'Disqualified']);

const BUILDER_MUTABLE_FIELDS = [
  'brand_name', 'legal_entity_name', 'corporate_website', 'website_status',
  'registered_office_address', 'city', 'locality', 'state', 'pincode', 'address_source',
  'official_telephone', 'official_mobile', 'official_email', 'sales_email', 'general_email',
  'contact_page_url', 'whatsapp_channel', 'whatsapp_classification', 'whatsapp_link', 'whatsapp_notes',
  'company_category', 'residential_project_count', 'project_names', 'project_status',
  'residential_segment', 'maharera_registration', 'maharera_location', 'maharera_url',
  'maharera_classification', 'maharera_notes', 'project_class', 'primary_asset_type',
  'outreach_readiness', 'recommended_channel', 'commercial_suitability', 'notes',
  'lead_priority_tier', 'source_dataset', 'import_batch_id', 'business_mobile',
  'whatsapp_number', 'whatsapp_direct_link', 'official_contact_page'
];

function pickAllowedBuilderFields(body = {}) {
  const safe = {};
  for (const key of BUILDER_MUTABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
      safe[key] = body[key];
    }
  }
  return safe;
}

function isVerifiedContact(contact) {
  return String(contact && contact.verification_status || '').trim().toLowerCase() === 'verified';
}

function isVerifiedDecisionMaker(contact) {
  if (!isVerifiedContact(contact)) return false;
  const dmClass = String(contact && contact.dm_class || '').trim().toUpperCase();
  if (dmClass.includes('NOT VERIFIED') || dmClass.includes('SWITCHBOARD') || dmClass.includes('UNVERIFIED')) {
    return false;
  }
  if (dmClass === 'VERIFIED DECISION-MAKER') return true;
  const des = String(contact && contact.designation || '').toLowerCase();
  return DM_KEYWORDS.some(k => des.includes(k));
}

function isCompanyDecisionMakerVerified(builder) {
  if (!builder) return false;
  const isVerifiedCompany = String(builder.verification_status || '').trim().toLowerCase() === 'verified';
  const dmName = String(builder.decision_maker_name || builder.key_decision_maker_name || '').trim();
  const dmCat = String(builder.decision_maker_category || '').trim().toUpperCase();
  if (!isVerifiedCompany || !dmName) return false;
  if (dmCat.includes('NOT VERIFIED') || dmCat.includes('SWITCHBOARD') || dmCat.includes('UNVERIFIED')) return false;
  return true;
}

function parsePagination(pageRaw, limitRaw, defaultLimit = 50, maxLimit = 200) {
  const parsedPage = Number.parseInt(String(pageRaw ?? '1'), 10);
  const parsedLimit = Number.parseInt(String(limitRaw ?? defaultLimit), 10);
  const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const limit = Number.isInteger(parsedLimit) && parsedLimit >= 1 ? Math.min(parsedLimit, maxLimit) : defaultLimit;
  return { page, limit };
}

function sanitizeExcelCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  const str = String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// 1. GET /api/portal/builder/companies
router.get('/companies', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const { search, city, verification_status, outreach_readiness, subview = 'all', page = 1, limit = 50 } = req.query;
  let builders = db.getAll('builder_companies');
  const contacts = db.getAll('builder_contacts');
  const pipeline = db.getAll('builder_pipeline');
  const activities = db.getAll('builder_activities');

  // Compute subview counts across the entire dataset
  const residentialBuilders = builders.filter(b =>
    (b.company_category && b.company_category.toLowerCase().includes('residential')) ||
    (b.residential_project_count && b.residential_project_count > 0)
  );

  const contactBuilderIds = new Set(contacts.map(c => c.builder_id));
  // APR006-P4-01: Never treat unverified contacts as valid decision-makers
  const dmContacts = contacts.filter(isVerifiedDecisionMaker);
  const dmBuilderIds = new Set([
    ...dmContacts.map(c => c.builder_id),
    ...builders.filter(isCompanyDecisionMakerVerified).map(b => b.builder_id)
  ]);
  const pipelineBuilderIds = new Set(pipeline.map(d => d.builder_id));
  const activityBuilderIds = new Set(activities.map(a => a.builder_id));

  const subviewCounts = {
    all: builders.length,
    residential: residentialBuilders.length,
    contacts: builders.filter(b => contactBuilderIds.has(b.builder_id)).length,
    decision_makers: builders.filter(b => dmBuilderIds.has(b.builder_id)).length,
    pipeline: builders.filter(b => pipelineBuilderIds.has(b.builder_id)).length,
    tasks: builders.filter(b => activityBuilderIds.has(b.builder_id)).length
  };

  // Subview filtering
  if (subview === 'residential') {
    builders = residentialBuilders;
  } else if (subview === 'contacts') {
    builders = builders.filter(b => contactBuilderIds.has(b.builder_id));
  } else if (subview === 'decision_makers') {
    builders = builders.filter(b => dmBuilderIds.has(b.builder_id));
  } else if (subview === 'pipeline') {
    builders = builders.filter(b => pipelineBuilderIds.has(b.builder_id));
  } else if (subview === 'tasks') {
    builders = builders.filter(b => activityBuilderIds.has(b.builder_id));
  }

  // General Filter
  if (search) {
    const q = String(search).toLowerCase();
    builders = builders.filter(b =>
      (b.company_name && b.company_name.toLowerCase().includes(q)) ||
      (b.brand_name && b.brand_name.toLowerCase().includes(q)) ||
      (b.builder_id && b.builder_id.toLowerCase().includes(q)) ||
      (b.city && b.city.toLowerCase().includes(q))
    );
  }
  if (city) {
    const cityLower = String(city).toLowerCase();
    builders = builders.filter(b => b.city && b.city.toLowerCase() === cityLower);
  }
  if (verification_status) {
    builders = builders.filter(b => b.verification_status === verification_status);
  }
  if (outreach_readiness) {
    builders = builders.filter(b => b.outreach_readiness === outreach_readiness);
  }

  // Enrich builder records with verified contacts and pipeline summaries for views
  const enrichedBuilders = builders.map(b => {
    const bContacts = contacts.filter(c => c.builder_id === b.builder_id);
    const bVerifiedContacts = bContacts.filter(isVerifiedContact);
    const bPipeline = pipeline.find(p => p.builder_id === b.builder_id);
    const bActivities = activities.filter(a => a.builder_id === b.builder_id);
    const bDMs = bContacts.filter(isVerifiedDecisionMaker);
    const companyDmVerified = isCompanyDecisionMakerVerified(b);

    // APR006-P4-02: Resolve verified decision-maker using canonical full_name fallback to contact_name
    const verifiedDmFromContact = bDMs[0] ? (bDMs[0].full_name || bDMs[0].contact_name || '') : '';
    const dmName = verifiedDmFromContact || (companyDmVerified ? (b.decision_maker_name || b.key_decision_maker_name || '') : '');
    const dmRole = (bDMs[0] && bDMs[0].designation) || (companyDmVerified ? (b.executive_designation || b.key_decision_maker_role || '') : '');
    const waUrl = b.whatsapp_direct_link || b.whatsapp_direct_url || (b.official_mobile ? `https://wa.me/${b.official_mobile.replace(/[^0-9]/g, '')}` : '');
    const reraUrl = b.maharera_url || b.maharera_verification_url || 'https://maharera.maharashtra.gov.in/';
    const batchId = b.import_batch_id || b.source_lineage_batch_id || 'BATCH-20261107-P5318';

    return {
      ...b,
      key_decision_maker_name: dmName,
      key_decision_maker_role: dmRole,
      decision_maker_verified: Boolean(dmName && (bDMs.length > 0 || companyDmVerified)),
      whatsapp_direct_url: waUrl,
      maharera_verification_url: reraUrl,
      source_lineage_batch_id: batchId,
      contactsCount: bContacts.length,
      verifiedContactsCount: bVerifiedContacts.length,
      unverifiedContactsCount: bContacts.length - bVerifiedContacts.length,
      decisionMakers: bDMs,
      contacts: bContacts,
      pipelineDeal: bPipeline || null,
      activitiesCount: bActivities.length
    };
  });

  // Bounded Pagination (APR006-P4-03)
  const total = enrichedBuilders.length;
  const { page: p, limit: l } = parsePagination(page, limit);
  const startIndex = (p - 1) * l;
  const paginated = enrichedBuilders.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    subview,
    subviewCounts,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 2. GET /api/portal/builder/companies/:id
router.get('/companies/:id', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const builderId = req.params.id;
  const company = db.getById('builder_companies', builderId);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Builder company not found.' });
  }

  const contacts = db.find('builder_contacts', c => c.builder_id === builderId);
  const maharera = db.find('builder_maharera', m => m.builder_id === builderId);
  const deals = db.find('builder_pipeline', d => d.builder_id === builderId);
  const activities = db.find('builder_activities', a => a.builder_id === builderId);

  return res.json({
    success: true,
    data: {
      ...company,
      contacts,
      maharera,
      deals,
      activities
    }
  });
});

// 2b. POST /api/portal/builder/companies
router.post('/companies', requirePortalAuth, requirePermission('builder:write'), async (req, res) => {
  const { builder_id, company_name, city } = req.body || {};
  if (!company_name || !company_name.toString().trim()) {
    return res.status(400).json({ success: false, message: 'company_name is required.' });
  }

  const normalizedName = company_name.toString().trim();
  const normalizedCity = (city || 'Maharashtra').toString().trim();
  const duplicate = db.findOne('builder_companies', c =>
    (c.company_name || '').toLowerCase().trim() === normalizedName.toLowerCase() &&
    (c.city || '').toLowerCase().trim() === normalizedCity.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: `Duplicate builder record exists (${duplicate.builder_id}) for ${normalizedName} in ${normalizedCity}.`
    });
  }

  const newId = builder_id && builder_id.toString().trim()
    ? builder_id.toString().trim()
    : `ALS-BLD-${Date.now().toString(36).toUpperCase()}`;

  // APR006-P4-03 / APR006-P4-05: Strict allowlist + force Unverified_Pending + provenance on creation
  const safeFields = pickAllowedBuilderFields(req.body);
  const created = await db.upsertAsync('builder_companies', 'builder_id', {
    ...safeFields,
    builder_id: newId,
    company_name: normalizedName,
    city: normalizedCity,
    state: safeFields.state || 'Maharashtra',
    lead_priority_tier: safeFields.lead_priority_tier || 'A',
    verification_status: 'Unverified_Pending',
    pipeline_stage: 1,
    source_dataset: safeFields.source_dataset || 'MANUAL_PORTAL_ENTRY',
    import_batch_id: safeFields.import_batch_id || `MANUAL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  db.logAudit(req.portalUser.userId, 'BUILDER', 'CREATE_BUILDER_COMPANY', { builder_id: newId, company_name: normalizedName }, req.ip);

  return res.status(201).json({ success: true, message: 'Builder company created successfully.', data: created });
});

// 3. PUT /api/portal/builder/companies/:id
router.put('/companies/:id', requirePortalAuth, requirePermission('builder:write'), async (req, res) => {
  const builderId = req.params.id;
  const existing = db.getById('builder_companies', builderId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Builder company not found.' });
  }

  // APR006-P4-03: Strict allowlist (no mass-assignment of privileged or internal fields)
  const safeFields = pickAllowedBuilderFields(req.body);
  if (req.body && req.body.company_name && String(req.body.company_name).trim()) {
    safeFields.company_name = String(req.body.company_name).trim();
  }
  if (req.body && req.body.verification_status !== undefined) {
    if (!VALID_VERIFICATION_STATUSES.has(req.body.verification_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid verification_status. Allowed values: ${Array.from(VALID_VERIFICATION_STATUSES).join(', ')}.`
      });
    }
    safeFields.verification_status = req.body.verification_status;
  }

  const updated = await db.upsertAsync('builder_companies', 'builder_id', {
    ...existing,
    ...safeFields,
    builder_id: builderId, // Prevent tampering with PK
    updated_at: new Date().toISOString()
  });

  db.logAudit(req.portalUser.userId, 'BUILDER', 'UPDATE_BUILDER_COMPANY', { builder_id: builderId, changes: Object.keys(safeFields) }, req.ip);

  return res.json({ success: true, message: 'Builder company updated successfully.', data: updated });
});

// 4. GET /api/portal/builder/pipeline
router.get('/pipeline', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const deals = db.getAll('builder_pipeline');
  const companies = db.getAll('builder_companies');
  const companyMap = new Map(companies.map(c => [c.builder_id, c]));

  // 19 Standard Stages
  const STAGES = [
    { id: 1, name: 'Research Pending' },
    { id: 2, name: 'Company Identity Verified' },
    { id: 3, name: 'Official Channel Verified' },
    { id: 4, name: 'Department Confirmation Pending' },
    { id: 5, name: 'Partnership Contact Identified' },
    { id: 6, name: 'Introduction Ready' },
    { id: 7, name: 'Introduction Sent — Manual Confirmation' },
    { id: 8, name: 'Response Received' },
    { id: 9, name: 'Discovery Meeting Scheduled' },
    { id: 10, name: 'Discovery Meeting Completed' },
    { id: 11, name: 'Proposal Requested' },
    { id: 12, name: 'Proposal Shared' },
    { id: 13, name: 'Commercial Discussion' },
    { id: 14, name: 'Legal Review' },
    { id: 15, name: 'Agreement Pending' },
    { id: 16, name: 'Partnership Active' },
    { id: 17, name: 'Follow-up Later' },
    { id: 18, name: 'Not Interested' },
    { id: 19, name: 'Disqualified' }
  ];

  const enrichedDeals = deals.map(d => ({
    ...d,
    company: companyMap.get(d.builder_id) || {}
  }));

  const grouped = {};
  STAGES.forEach(s => {
    grouped[s.id] = {
      stageId: s.id,
      stageName: s.name,
      deals: enrichedDeals.filter(d => d.stage === s.id)
    };
  });

  return res.json({ success: true, stages: STAGES, grouped, totalDeals: deals.length });
});

// 5. PUT /api/portal/builder/pipeline/:dealId/stage
router.put('/pipeline/:dealId/stage', requirePortalAuth, requirePermission('builder:write'), (req, res) => {
  const dealId = req.params.dealId;
  const { stage, stage_name, notes } = req.body || {};

  // APR006-P4-03: Strictly validate stage integer 1..19
  const parsedStage = Number(stage);
  if (!Number.isInteger(parsedStage) || parsedStage < 1 || parsedStage > 19) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pipeline stage. Must be an integer between 1 and 19.'
    });
  }

  const deal = db.getById('builder_pipeline', dealId);
  if (!deal) {
    return res.status(404).json({ success: false, message: 'Pipeline deal not found.' });
  }

  const prevStage = deal.stage;
  deal.stage = parsedStage;
  if (stage_name) deal.stage_name = String(stage_name).trim();
  if (notes) deal.notes = (deal.notes ? deal.notes + '\n' : '') + `[${new Date().toISOString().split('T')[0]}] Stage changed to ${parsedStage}: ${String(notes)}`;
  deal.updated_at = new Date().toISOString();

  // Probability auto-adjustment based on stage progression
  if (deal.stage >= 16) deal.probability_pct = 100;
  else if (deal.stage >= 12) deal.probability_pct = 75;
  else if (deal.stage >= 9) deal.probability_pct = 50;
  else if (deal.stage >= 6) deal.probability_pct = 35;

  db.upsert('builder_pipeline', 'deal_id', deal);
  db.logAudit(req.portalUser.userId, 'BUILDER', 'PIPELINE_STAGE_CHANGE', { dealId, fromStage: prevStage, toStage: deal.stage }, req.ip);

  return res.json({ success: true, message: 'Pipeline stage updated.', data: deal });
});

// 6. GET /api/portal/builder/contacts
router.get('/contacts', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const { classification, verification_status } = req.query;
  let contacts = db.getAll('builder_contacts');

  if (classification) {
    contacts = contacts.filter(c => c.contact_classification === classification);
  }
  if (verification_status) {
    contacts = contacts.filter(c => c.verification_status === verification_status);
  }

  return res.json({ success: true, total: contacts.length, data: contacts });
});

// 7. GET /api/portal/builder/maharera
router.get('/maharera', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const records = db.getAll('builder_maharera');
  return res.json({ success: true, total: records.length, data: records });
});

// 8. GET /api/portal/builder/export
router.get('/export', requirePortalAuth, requirePermission('builder:export'), async (req, res) => {
  try {
    const format = req.query.format || 'xlsx';
    const builders = db.getAll('builder_companies');
    const contacts = db.getAll('builder_contacts');
    const mahareraRecords = db.getAll('builder_maharera');

    const reraByBuilder = new Map();
    mahareraRecords.forEach(r => {
      if (!r || !r.builder_id || !r.registration_number) return;
      const list = reraByBuilder.get(r.builder_id) || [];
      list.push(String(r.registration_number).trim());
      reraByBuilder.set(r.builder_id, list);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Maharashtra Builders');

    worksheet.columns = [
      { header: 'Builder ID', key: 'builder_id', width: 20 },
      { header: 'Company Name', key: 'company_name', width: 32 },
      { header: 'Brand Name', key: 'brand_name', width: 25 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'Key Decision-Maker', key: 'key_decision_maker_name', width: 25 },
      { header: 'Decision-Maker Role', key: 'key_decision_maker_role', width: 25 },
      { header: 'Official Telephone', key: 'official_telephone', width: 20 },
      { header: 'WhatsApp / Mobile', key: 'official_mobile', width: 22 },
      { header: 'WhatsApp Direct URL', key: 'whatsapp_direct_url', width: 35 },
      { header: 'Official Email', key: 'official_email', width: 30 },
      { header: 'Corporate Website', key: 'corporate_website', width: 30 },
      { header: 'Project Class', key: 'project_class', width: 20 },
      { header: 'Primary Asset Type', key: 'primary_asset_type', width: 22 },
      { header: 'MahaRERA Numbers', key: 'rera_numbers', width: 30 },
      { header: 'MahaRERA Verification URL', key: 'maharera_verification_url', width: 40 },
      { header: 'Qualification Score', key: 'qualification_score', width: 20 },
      { header: 'Verification Status', key: 'verification_status', width: 20 },
      { header: 'Outreach Readiness', key: 'outreach_readiness', width: 30 },
      { header: 'Source Lineage Batch', key: 'source_lineage_batch_id', width: 25 }
    ];

    builders.forEach(b => {
      const bVerifiedDMs = contacts.filter(c => c.builder_id === b.builder_id && isVerifiedDecisionMaker(c));
      const companyDmOk = isCompanyDecisionMakerVerified(b);
      const dmName = (bVerifiedDMs[0] && (bVerifiedDMs[0].full_name || bVerifiedDMs[0].contact_name)) ||
        (companyDmOk ? (b.decision_maker_name || b.key_decision_maker_name || '') : '');
      const dmRole = (bVerifiedDMs[0] && bVerifiedDMs[0].designation) ||
        (companyDmOk ? (b.executive_designation || b.key_decision_maker_role || '') : '');

      const joinedRera = reraByBuilder.get(b.builder_id) || [];
      const fallbackRera = Array.isArray(b.maharera_reg_numbers)
        ? b.maharera_reg_numbers
        : (b.maharera_registration ? [String(b.maharera_registration)] : []);
      const reraJoinedStr = Array.from(new Set([...joinedRera, ...fallbackRera].filter(Boolean))).join(', ');

      // APR006-P4-04: Formula-injection sanitization across all exported cells
      worksheet.addRow({
        builder_id: sanitizeExcelCell(b.builder_id),
        company_name: sanitizeExcelCell(b.company_name),
        brand_name: sanitizeExcelCell(b.brand_name),
        city: sanitizeExcelCell(b.city),
        key_decision_maker_name: sanitizeExcelCell(dmName),
        key_decision_maker_role: sanitizeExcelCell(dmRole),
        official_telephone: sanitizeExcelCell(b.official_telephone),
        official_mobile: sanitizeExcelCell(b.whatsapp_channel || b.official_mobile),
        whatsapp_direct_url: sanitizeExcelCell(b.whatsapp_direct_link || b.whatsapp_direct_url || ''),
        official_email: sanitizeExcelCell(b.official_email),
        corporate_website: sanitizeExcelCell(b.corporate_website),
        project_class: sanitizeExcelCell(b.project_class || b.residential_segment || ''),
        primary_asset_type: sanitizeExcelCell(b.primary_asset_type || b.company_category || ''),
        rera_numbers: sanitizeExcelCell(reraJoinedStr),
        maharera_verification_url: sanitizeExcelCell(b.maharera_url || b.maharera_verification_url || ''),
        qualification_score: b.qualification_score,
        verification_status: sanitizeExcelCell(b.verification_status),
        outreach_readiness: sanitizeExcelCell(b.outreach_readiness),
        source_lineage_batch_id: sanitizeExcelCell(b.import_batch_id || b.source_lineage_batch_id || 'BATCH-20261107-P5318')
      });
    });

    db.logAudit(req.portalUser.userId, 'BUILDER', 'EXPORT_BUILDER_DATA', { format, count: builders.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Builder_Master_Database.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[BuilderExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate export file.' });
  }
});

// 9. POST /api/portal/builder/companies/:id/crm-handover
// Controlled Qualified Builder Prospect -> AVANI AI CRM Handover (Sections 6, 10, 15)
router.post('/companies/:id/crm-handover', requirePortalAuth, requirePermission('builder:write'), async (req, res) => {
  try {
    const builderId = req.params.id;
    const builder = db.getById('builder_companies', builderId);
    if (!builder) {
      return res.status(404).json({ success: false, code: 'BUILDER_NOT_FOUND', message: 'Builder company not found.' });
    }

    const body = req.body || {};

    // 1. Strict verification guard: never promote unverified builder or unverified contact into CRM
    const contacts = db.getAll('builder_contacts').filter(c => c.builder_id === builderId);
    const verifiedDMs = contacts.filter(isVerifiedDecisionMaker);
    const companyDmVerified = isCompanyDecisionMakerVerified(builder);

    if (verifiedDMs.length === 0 && !companyDmVerified) {
      return res.status(400).json({
        success: false,
        code: 'UNVERIFIED_PROSPECT_CONTACT',
        message: 'CRM handover blocked: Builder company or decision-maker contact is not verified. Unverified database prospects cannot be converted into active CRM leads.'
      });
    }

    // 2. Strict legitimate communication permission / consent guard
    const isConsentGranted = body.consent === true || body.consentStatus === 'GRANTED';
    if (!isConsentGranted) {
      return res.status(403).json({
        success: false,
        code: 'CONSENT_REQUIRED',
        message: 'CRM handover blocked: Explicit communication permission (consent=true or consentStatus="GRANTED") is required before transferring a builder prospect to AVANI AI CRM.'
      });
    }

    // 3. Resolve verified contact person & valid Indian 10-digit mobile
    const primaryDm = verifiedDMs[0] || {};
    const contactName = String(
      body.contact_person ||
      primaryDm.full_name ||
      primaryDm.contact_name ||
      builder.decision_maker_name ||
      builder.key_decision_maker_name ||
      builder.company_name
    ).trim();

    const rawPhone = String(
      body.phone ||
      body.mobile ||
      primaryDm.mobile ||
      primaryDm.phone ||
      builder.official_mobile ||
      builder.whatsapp_channel ||
      builder.official_telephone ||
      ''
    ).trim();
    const digits = rawPhone.replace(/\D/g, '');
    const raw10 = digits.length > 10 ? digits.slice(-10) : digits;
    if (raw10.length !== 10 || !/^[6-9]\d{9}$/.test(raw10)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_MOBILE',
        message: 'A valid 10-digit Indian mobile number (starting with 6-9) is required for CRM handover.'
      });
    }

    const requestedAmount = body.requestedAmount ?? body.estimated_amount ?? 25000000;
    const idempotencyKey = String(body.idempotencyKey || `BLD-CRM-${builderId}`).trim().slice(0, 64);
    const provenanceBatchId = builder.import_batch_id || builder.source_lineage_batch_id || 'BATCH-20261107-P5318';

    const crmPayload = {
      name: `${contactName} (${builder.company_name})`.slice(0, 110),
      phone: `+91${raw10}`,
      city: String(builder.city || 'Latur').trim(),
      loanType: 'Home Loan',
      requestedAmount: String(requestedAmount),
      leadSource: 'BUILDER_DATABASE_HANDOVER',
      consent: true,
      consentStatus: 'GRANTED',
      idempotencyKey,
      sourceProject: 'PROJECT_A_UNIFIED_PORTAL',
      sourceModule: 'BUILDER_DATABASE',
      sourceRecordId: builderId,
      provenanceBatchId
    };

    const crmBaseUrl = String(body.crmBaseUrl || process.env.AVANI_CRM_URL || process.env.NEXT_PUBLIC_CRM_URL || '').trim();
    let crmResponse = null;

    if (crmBaseUrl) {
      const axios = require('axios');
      const resp = await axios.post(`${crmBaseUrl.replace(/\/+$/, '')}/api/public/enquiry`, crmPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
        validateStatus: () => true
      });
      if (resp.status >= 400 || !resp.data || !resp.data.success) {
        return res.status(resp.status >= 400 ? resp.status : 502).json({
          success: false,
          code: (resp.data && resp.data.error) || 'CRM_HANDOVER_REJECTED',
          message: (resp.data && resp.data.message) || 'AVANI AI CRM rejected the builder handover request.'
        });
      }
      crmResponse = resp.data;
    }

    db.logAudit(
      req.portalUser.userId,
      'BUILDER',
      'BUILDER_CRM_HANDOVER',
      {
        builderId,
        idempotencyKey,
        provenanceBatchId,
        crmLeadId: crmResponse ? crmResponse.leadId : null,
        crmCustomerId: crmResponse ? crmResponse.customerId : null
      },
      req.ip
    );

    return res.status(201).json({
      success: true,
      handover: true,
      sourceModule: 'BUILDER_DATABASE',
      builder_id: builderId,
      provenanceBatchId,
      idempotencyKey,
      crmPayload,
      crmResult: crmResponse
    });
  } catch (err) {
    console.error('[BuilderCrmHandover] Error:', err.message);
    return res.status(502).json({
      success: false,
      code: 'CRM_HANDOVER_UNAVAILABLE',
      message: 'Unable to reach AVANI AI CRM for builder opportunity handover.'
    });
  }
});

router._helpers = {
  isVerifiedContact,
  isVerifiedDecisionMaker,
  isCompanyDecisionMakerVerified,
  parsePagination,
  sanitizeExcelCell,
  pickAllowedBuilderFields
};

module.exports = router;
