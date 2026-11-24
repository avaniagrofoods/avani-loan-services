// src/routes/educationPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MODULE B: EDUCATION INSTITUTIONAL FUNDING API ROUTES
// Absolute Data Separation: Only interacts with education_* tables
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission } = require('../middleware/portalAuthMiddleware.cjs');
const ExcelJS = require('exceljs');
const { isSchool, isCollege, getCollegeSubtypes, getSchoolSubtypes } = require('../utils/educationCategoryHelper.cjs');

// ─────────────────────────────────────────────────────────────────────────────
// APR-006 Phase 5 Hardening Helpers (Zero Fabricated Estimates, Allowlist, Validation, Excel Safety)
// ─────────────────────────────────────────────────────────────────────────────
const FUNDING_ESTIMATE_DISCLAIMER =
  'Preliminary research estimate only — NOT an approved loan, confirmed institutional demand, or actual revenue.';

const VALID_CONSENT_STATUSES = new Set(['Granted', 'Pending_Request', 'Opted_Out', 'Revoked']);
const VALID_VERIFICATION_STATUSES = new Set(['Verified', 'Unverified_Pending', 'Needs_Review', 'Disqualified']);

const EDUCATION_MUTABLE_FIELDS = [
  'institution_category', 'subcategory', 'board_affiliation', 'ownership_type',
  'parent_trust_society', 'registration_details', 'year_established', 'number_of_branches',
  'student_capacity', 'approx_enrolment', 'official_email', 'official_telephone',
  'complete_address', 'city', 'district', 'state', 'pin_code', 'google_maps_url',
  'potential_funding_requirement', 'funding_category', 'funding_purpose',
  'lead_priority_tier', 'institution_website', 'website', 'leadership_governance',
  'funding_classification_type', 'secured_funding_potential', 'unsecured_funding_potential',
  'existing_borrowing_information', 'property_ownership_information',
  'land_building_expansion_signals', 'new_campus_branch_expansion',
  'reported_expansion_plans', 'potential_collateral_category', 'funding_urgency',
  'reason_for_funding_opportunity', 'research_evidence_url', 'lead_source',
  'strategic_remarks', 'source_dataset', 'import_batch_id', 'source_url'
];

function safeLower(val) {
  return String(val || '').toLowerCase();
}

function pickAllowedEducationFields(body = {}) {
  const safe = {};
  for (const key of EDUCATION_MUTABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
      safe[key] = body[key];
    }
  }
  return safe;
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

function isVerifiedEducationContact(contact) {
  return safeLower(contact && contact.verification_status).trim() === 'verified';
}

const FUNDING_CATEGORIES = [
  'School infrastructure finance',
  'College infrastructure finance',
  'Education institution expansion finance',
  'Land and building finance',
  'Construction finance',
  'Renovation and modernization finance',
  'Equipment and laboratory finance',
  'Working capital finance',
  'Loan Against Property',
  'Secured institutional funding',
  'Unsecured business funding',
  'Educational trust funding'
];

const STAGES = [
  { id: 1, name: 'Research Pending' },
  { id: 2, name: 'Institution Verified' },
  { id: 3, name: 'Contact Verification Pending' },
  { id: 4, name: 'Decision-Maker Identified' },
  { id: 5, name: 'Funding Potential Identified' },
  { id: 6, name: 'Permission Request Required' },
  { id: 7, name: 'Permission Received' },
  { id: 8, name: 'Qualified Lead' },
  { id: 9, name: 'Introduction Ready' },
  { id: 10, name: 'Introduction Sent' },
  { id: 11, name: 'Response Received' },
  { id: 12, name: 'Discovery Meeting' },
  { id: 13, name: 'Financial Documents Requested' },
  { id: 14, name: 'Preliminary Eligibility Assessment' },
  { id: 15, name: 'Lender Matching' },
  { id: 16, name: 'Application Initiated' },
  { id: 17, name: 'Application Submitted' },
  { id: 18, name: 'Sanction Pending' },
  { id: 19, name: 'Sanctioned' },
  { id: 20, name: 'Disbursement Pending' },
  { id: 21, name: 'Disbursed' },
  { id: 22, name: 'Follow-up Later' },
  { id: 23, name: 'Not Interested' },
  { id: 24, name: 'Disqualified' }
];

// 1. GET /api/portal/education/institutions
router.get('/institutions', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { search, category, state, city, tier, page = 1, limit = 50 } = req.query;
  let institutions = db.getAll('education_institutions');

  // Filters
  if (search) {
    const q = search.toLowerCase();
    institutions = institutions.filter(i =>
      (i.institution_name && i.institution_name.toLowerCase().includes(q)) ||
      (i.institution_id && i.institution_id.toLowerCase().includes(q)) ||
      (i.city && i.city.toLowerCase().includes(q)) ||
      (i.parent_trust_society && i.parent_trust_society.toLowerCase().includes(q))
    );
  }
  if (category) {
    institutions = institutions.filter(i => i.institution_category && i.institution_category.toLowerCase() === category.toLowerCase());
  }
  if (state) {
    institutions = institutions.filter(i => i.state && i.state.toLowerCase() === state.toLowerCase());
  }
  if (city) {
    institutions = institutions.filter(i => i.city && i.city.toLowerCase() === city.toLowerCase());
  }
  if (tier) {
    institutions = institutions.filter(i => i.lead_priority_tier === tier);
  }

  const total = institutions.length;
  const { page: p, limit: l } = parsePagination(page, limit);
  const startIndex = (p - 1) * l;
  const paginated = institutions.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
    data: paginated
  });
});

// 1.1 GET /api/portal/education/schools (Dedicated School Funding Database)
router.get('/schools', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { search, city, state, tier, subview = 'all', page = 1, limit = 50 } = req.query;
  const allInstitutions = db.getAll('education_institutions');
  const allPipeline = db.getAll('education_pipeline');
  const allContacts = db.getAll('education_contacts');

  // Filter strictly to the 24 schools
  let schools = allInstitutions.filter(isSchool);

  // Subview counts across all 24 schools
  const groupsCount = schools.filter(s => getSchoolSubtypes(s).includes('groups')).length;
  const trustsCount = schools.filter(s => getSchoolSubtypes(s).includes('trusts')).length;
  const prospectsCount = schools.filter(s => getSchoolSubtypes(s).includes('prospects')).length;
  const schoolIdsSet = new Set(schools.map(s => s.institution_id));
  const schoolPipelineDeals = allPipeline.filter(p => schoolIdsSet.has(p.institution_id));
  const pipelineCount = new Set(schoolPipelineDeals.map(p => p.institution_id)).size;

  const subviewCounts = {
    all: schools.length, // 24
    groups: groupsCount,
    trusts: trustsCount,
    prospects: prospectsCount,
    pipeline: pipelineCount
  };

  // Subview filter
  if (subview === 'groups') {
    schools = schools.filter(s => getSchoolSubtypes(s).includes('groups'));
  } else if (subview === 'trusts') {
    schools = schools.filter(s => getSchoolSubtypes(s).includes('trusts'));
  } else if (subview === 'prospects') {
    schools = schools.filter(s => getSchoolSubtypes(s).includes('prospects'));
  } else if (subview === 'pipeline') {
    const activeDealInstIds = new Set(schoolPipelineDeals.map(p => p.institution_id));
    schools = schools.filter(s => activeDealInstIds.has(s.institution_id));
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    schools = schools.filter(s =>
      (s.institution_name && s.institution_name.toLowerCase().includes(q)) ||
      (s.institution_id && s.institution_id.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.parent_trust_society && s.parent_trust_society.toLowerCase().includes(q))
    );
  }
  if (city) {
    schools = schools.filter(s => s.city && s.city.toLowerCase() === city.toLowerCase());
  }
  if (state) {
    schools = schools.filter(s => s.state && s.state.toLowerCase() === state.toLowerCase());
  }
  if (tier) {
    schools = schools.filter(s => s.lead_priority_tier === tier);
  }

  // Enrich with data classification (APR006-P5-01: zero fabricated funding/title defaults)
  const enrichedSchools = schools.map(s => {
    const sContacts = allContacts.filter(c => c.institution_id === s.institution_id);
    const verifiedContactsCount = sContacts.filter(isVerifiedEducationContact).length;
    const sDeal = allPipeline.find(p => p.institution_id === s.institution_id);

    const lg = s.leadership_governance || {};
    return {
      ...s,
      chairman_name: lg.chairman_name || s.chairman_name || '',
      chairman_mobile: lg.professional_mobile || lg.public_whatsapp_number || s.chairman_mobile || '',
      chairman_email: lg.professional_email || s.chairman_email || '',
      secretary_name: lg.secretary_name || lg.managing_trustee_name || s.secretary_name || '',
      secretary_mobile: lg.secondary_official_contact || s.secretary_mobile || '',
      director_name: lg.director_name || s.director_name || '',
      finance_head_name: lg.finance_head_name || s.finance_head_name || '',
      potential_borrowing_capacity: s.potential_funding_requirement || s.potential_borrowing_capacity || 'Unassessed — Estimate Pending',
      secured_lap_potential: s.secured_funding_potential || s.secured_lap_potential || '',
      unsecured_od_potential: s.unsecured_funding_potential || s.unsecured_od_potential || '',
      potential_collateral: s.potential_collateral_category || s.potential_collateral || '',
      property_ownership_evidence: s.property_ownership_information || s.property_ownership_evidence || '',
      expansion_plans: s.reported_expansion_plans || s.expansion_plans || '',
      source_lineage_batch_id: s.import_batch_id || s.source_lineage_batch_id || 'BATCH-20261107-P5318',
      contactsCount: sContacts.length,
      verifiedContactsCount,
      unverifiedContactsCount: sContacts.length - verifiedContactsCount,
      contacts: sContacts,
      pipelineDeal: sDeal || null,
      funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
      is_estimate_not_revenue: true,
      data_classification: {
        confirmed_fields: [
          'institution_id', 'institution_name', 'board_affiliation',
          'ownership_type', 'parent_trust_society', 'year_established',
          'official_email', 'official_telephone', 'complete_address', 'city', 'state'
        ],
        research_estimates: [
          { field: 'student_capacity', value: s.student_capacity, note: 'Estimated from branch capacity and infrastructure disclosures' },
          { field: 'approx_enrolment', value: s.approx_enrolment, note: 'Estimated from public student intake data' },
          { field: 'potential_funding_requirement', value: s.potential_funding_requirement, note: 'Preliminary infrastructure assessment estimate (NOT approved loan or revenue)' }
        ],
        is_estimate: true,
        is_estimate_not_revenue: true
      }
    };
  });

  const total = enrichedSchools.length;
  const { page: p, limit: l } = parsePagination(page, limit);
  const startIndex = (p - 1) * l;
  const paginated = enrichedSchools.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    database_type: 'SCHOOL_FUNDING_DATABASE',
    funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
    is_estimate_not_revenue: true,
    subview,
    subviewCounts,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 1.2 GET /api/portal/education/schools/export (Excel Export for Schools)
router.get('/schools/export', requirePortalAuth, requirePermission('education:export'), async (req, res) => {
  try {
    const allInstitutions = db.getAll('education_institutions');
    const schools = allInstitutions.filter(isSchool);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('School Funding Database');

    worksheet.columns = [
      { header: 'School ID', key: 'institution_id', width: 22 },
      { header: 'School / Group Name', key: 'institution_name', width: 38 },
      { header: 'Affiliation / Category', key: 'subcategory', width: 30 },
      { header: 'Parent Trust / Society', key: 'parent_trust', width: 32 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Chairman / President', key: 'chairman_name', width: 25 },
      { header: 'Chairman Mobile', key: 'chairman_mobile', width: 20 },
      { header: 'Secretary / Trustee', key: 'secretary_name', width: 25 },
      { header: 'Director / Principal', key: 'director_name', width: 25 },
      { header: 'Finance Head', key: 'finance_head_name', width: 22 },
      { header: 'Official Telephone', key: 'telephone', width: 20 },
      { header: 'Official Email', key: 'email', width: 32 },
      { header: 'Potential Funding Need', key: 'funding_req', width: 25 },
      { header: 'Borrowing Capacity', key: 'borrowing_capacity', width: 24 },
      { header: 'Secured LAP Potential', key: 'secured_lap', width: 24 },
      { header: 'Unsecured OD Potential', key: 'unsecured_od', width: 24 },
      { header: 'Potential Collateral', key: 'collateral', width: 25 },
      { header: 'Property Evidence', key: 'property_evidence', width: 22 },
      { header: 'Expansion Plans', key: 'expansion_plans', width: 35 },
      { header: 'Priority Tier', key: 'tier', width: 14 },
      { header: 'Score (100-Pt)', key: 'score', width: 14 },
      { header: 'Source Lineage Batch', key: 'source_batch', width: 25 }
    ];

    schools.forEach(s => {
      const lg = s.leadership_governance || {};
      worksheet.addRow({
        institution_id: sanitizeExcelCell(s.institution_id),
        institution_name: sanitizeExcelCell(s.institution_name),
        subcategory: sanitizeExcelCell(s.subcategory || s.board_affiliation || 'K-12 School'),
        parent_trust: sanitizeExcelCell(s.parent_trust_society),
        city: sanitizeExcelCell(s.city),
        state: sanitizeExcelCell(s.state),
        chairman_name: sanitizeExcelCell(lg.chairman_name || s.chairman_name || ''),
        chairman_mobile: sanitizeExcelCell(lg.professional_mobile || s.chairman_mobile || ''),
        secretary_name: sanitizeExcelCell(lg.secretary_name || lg.managing_trustee_name || s.secretary_name || ''),
        director_name: sanitizeExcelCell(lg.director_name || s.director_name || ''),
        finance_head_name: sanitizeExcelCell(lg.finance_head_name || s.finance_head_name || ''),
        telephone: sanitizeExcelCell(s.official_telephone),
        email: sanitizeExcelCell(s.official_email),
        funding_req: sanitizeExcelCell(s.potential_funding_requirement),
        borrowing_capacity: sanitizeExcelCell(s.potential_borrowing_capacity || s.potential_funding_requirement || ''),
        secured_lap: sanitizeExcelCell(s.secured_funding_potential || s.secured_lap_potential || ''),
        unsecured_od: sanitizeExcelCell(s.unsecured_funding_potential || s.unsecured_od_potential || ''),
        collateral: sanitizeExcelCell(s.potential_collateral_category || s.potential_collateral || ''),
        property_evidence: sanitizeExcelCell(s.property_ownership_information || s.property_ownership_evidence || ''),
        expansion_plans: sanitizeExcelCell(s.reported_expansion_plans || s.expansion_plans || ''),
        tier: sanitizeExcelCell(s.lead_priority_tier),
        score: s.qualification_score,
        source_batch: sanitizeExcelCell(s.import_batch_id || s.source_lineage_batch_id || 'BATCH-20261107-P5318')
      });
    });

    db.logAudit(req.portalUser.userId, 'EDUCATION', 'EXPORT_SCHOOLS_DATABASE', { count: schools.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="School_Funding_Database_Master.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[SchoolsExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate school export file.' });
  }
});

// 1.3 GET /api/portal/education/colleges (Dedicated College & University Funding Database)
router.get('/colleges', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { search, city, state, tier, subview = 'all', page = 1, limit = 50 } = req.query;
  const allInstitutions = db.getAll('education_institutions');
  const allPipeline = db.getAll('education_pipeline');
  const allContacts = db.getAll('education_contacts');

  // Filter strictly to the 56 colleges & universities
  let colleges = allInstitutions.filter(isCollege);

  // Subview counts across all 56 higher education institutions
  const engineeringCount = colleges.filter(c => getCollegeSubtypes(c).includes('engineering')).length;
  const medicalCount = colleges.filter(c => getCollegeSubtypes(c).includes('medical')).length;
  const autonomousCount = colleges.filter(c => getCollegeSubtypes(c).includes('autonomous')).length;
  const deemedCount = colleges.filter(c => getCollegeSubtypes(c).includes('deemed')).length;
  const trustsCount = colleges.filter(c => getCollegeSubtypes(c).includes('trusts')).length;
  const groupsCount = colleges.filter(c => getCollegeSubtypes(c).includes('groups')).length;
  const prospectsCount = colleges.filter(c => getCollegeSubtypes(c).includes('prospects')).length;
  const collegeIdsSet = new Set(colleges.map(c => c.institution_id));
  const collegePipelineDeals = allPipeline.filter(p => collegeIdsSet.has(p.institution_id));
  const pipelineCount = new Set(collegePipelineDeals.map(p => p.institution_id)).size;

  const subviewCounts = {
    all: colleges.length, // 56
    engineering: engineeringCount,
    medical: medicalCount,
    autonomous: autonomousCount,
    deemed: deemedCount,
    trusts: trustsCount,
    groups: groupsCount,
    prospects: prospectsCount,
    pipeline: pipelineCount
  };

  // Subview filter
  if (subview === 'engineering') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('engineering'));
  } else if (subview === 'medical') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('medical'));
  } else if (subview === 'autonomous') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('autonomous'));
  } else if (subview === 'deemed') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('deemed'));
  } else if (subview === 'trusts') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('trusts'));
  } else if (subview === 'groups') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('groups'));
  } else if (subview === 'prospects') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('prospects'));
  } else if (subview === 'pipeline') {
    const activeDealInstIds = new Set(collegePipelineDeals.map(p => p.institution_id));
    colleges = colleges.filter(c => activeDealInstIds.has(c.institution_id));
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    colleges = colleges.filter(c =>
      (c.institution_name && c.institution_name.toLowerCase().includes(q)) ||
      (c.institution_id && c.institution_id.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.parent_trust_society && c.parent_trust_society.toLowerCase().includes(q))
    );
  }
  if (city) {
    colleges = colleges.filter(c => c.city && c.city.toLowerCase() === city.toLowerCase());
  }
  if (state) {
    colleges = colleges.filter(c => c.state && c.state.toLowerCase() === state.toLowerCase());
  }
  if (tier) {
    colleges = colleges.filter(c => c.lead_priority_tier === tier);
  }

  // Enrich with contacts and deals (APR006-P5-01: zero fabricated funding/title defaults)
  const enrichedColleges = colleges.map(c => {
    const cContacts = allContacts.filter(ct => ct.institution_id === c.institution_id);
    const verifiedContactsCount = cContacts.filter(isVerifiedEducationContact).length;
    const cDeal = allPipeline.find(p => p.institution_id === c.institution_id);

    const lg = c.leadership_governance || {};
    return {
      ...c,
      chairman_name: lg.chairman_name || c.chairman_name || '',
      chairman_mobile: lg.professional_mobile || lg.public_whatsapp_number || c.chairman_mobile || '',
      chairman_email: lg.professional_email || c.chairman_email || '',
      secretary_name: lg.secretary_name || lg.managing_trustee_name || c.secretary_name || '',
      secretary_mobile: lg.secondary_official_contact || c.secretary_mobile || '',
      director_name: lg.director_name || c.director_name || '',
      finance_head_name: lg.finance_head_name || c.finance_head_name || '',
      potential_borrowing_capacity: c.potential_funding_requirement || c.potential_borrowing_capacity || 'Unassessed — Estimate Pending',
      secured_lap_potential: c.secured_funding_potential || c.secured_lap_potential || '',
      unsecured_od_potential: c.unsecured_funding_potential || c.unsecured_od_potential || '',
      potential_collateral: c.potential_collateral_category || c.potential_collateral || '',
      property_ownership_evidence: c.property_ownership_information || c.property_ownership_evidence || '',
      expansion_plans: c.reported_expansion_plans || c.expansion_plans || '',
      source_lineage_batch_id: c.import_batch_id || c.source_lineage_batch_id || 'BATCH-20261107-P5318',
      contactsCount: cContacts.length,
      verifiedContactsCount,
      unverifiedContactsCount: cContacts.length - verifiedContactsCount,
      contacts: cContacts,
      pipelineDeal: cDeal || null,
      subtypes: getCollegeSubtypes(c),
      funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
      is_estimate_not_revenue: true
    };
  });

  const total = enrichedColleges.length;
  const { page: p, limit: l } = parsePagination(page, limit);
  const startIndex = (p - 1) * l;
  const paginated = enrichedColleges.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    database_type: 'COLLEGE_UNIVERSITY_FUNDING_DATABASE',
    funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
    is_estimate_not_revenue: true,
    subview,
    subviewCounts,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 1.4 GET /api/portal/education/colleges/export (Excel Export for Colleges & Universities)
router.get('/colleges/export', requirePortalAuth, requirePermission('education:export'), async (req, res) => {
  try {
    const allInstitutions = db.getAll('education_institutions');
    const colleges = allInstitutions.filter(isCollege);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('College & University Database');

    worksheet.columns = [
      { header: 'Institution ID', key: 'institution_id', width: 22 },
      { header: 'College / University Name', key: 'institution_name', width: 42 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Subcategory / Specialization', key: 'subcategory', width: 36 },
      { header: 'Parent Trust / Society', key: 'parent_trust', width: 32 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Chancellor / Chairman', key: 'chairman_name', width: 25 },
      { header: 'Chairman Mobile', key: 'chairman_mobile', width: 20 },
      { header: 'Secretary / Trustee', key: 'secretary_name', width: 25 },
      { header: 'Principal / Dean', key: 'director_name', width: 25 },
      { header: 'Finance Head / CFO', key: 'finance_head_name', width: 22 },
      { header: 'Official Telephone', key: 'telephone', width: 20 },
      { header: 'Official Email', key: 'email', width: 32 },
      { header: 'Potential Funding Need', key: 'funding_req', width: 26 },
      { header: 'Borrowing Capacity', key: 'borrowing_capacity', width: 24 },
      { header: 'Secured LAP Potential', key: 'secured_lap', width: 24 },
      { header: 'Unsecured OD Potential', key: 'unsecured_od', width: 24 },
      { header: 'Potential Collateral', key: 'collateral', width: 25 },
      { header: 'Property Evidence', key: 'property_evidence', width: 22 },
      { header: 'Expansion Plans', key: 'expansion_plans', width: 35 },
      { header: 'Priority Tier', key: 'tier', width: 14 },
      { header: 'Score (100-Pt)', key: 'score', width: 14 },
      { header: 'Verification Status', key: 'status', width: 20 },
      { header: 'Source Lineage Batch', key: 'source_batch', width: 25 }
    ];

    colleges.forEach(c => {
      const lg = c.leadership_governance || {};
      worksheet.addRow({
        institution_id: sanitizeExcelCell(c.institution_id),
        institution_name: sanitizeExcelCell(c.institution_name),
        category: sanitizeExcelCell(c.institution_category),
        subcategory: sanitizeExcelCell(c.subcategory),
        parent_trust: sanitizeExcelCell(c.parent_trust_society),
        city: sanitizeExcelCell(c.city),
        state: sanitizeExcelCell(c.state),
        chairman_name: sanitizeExcelCell(lg.chairman_name || c.chairman_name || ''),
        chairman_mobile: sanitizeExcelCell(lg.professional_mobile || c.chairman_mobile || ''),
        secretary_name: sanitizeExcelCell(lg.secretary_name || lg.managing_trustee_name || c.secretary_name || ''),
        director_name: sanitizeExcelCell(lg.director_name || c.director_name || ''),
        finance_head_name: sanitizeExcelCell(lg.finance_head_name || c.finance_head_name || ''),
        telephone: sanitizeExcelCell(c.official_telephone),
        email: sanitizeExcelCell(c.official_email),
        funding_req: sanitizeExcelCell(c.potential_funding_requirement),
        borrowing_capacity: sanitizeExcelCell(c.potential_borrowing_capacity || c.potential_funding_requirement || ''),
        secured_lap: sanitizeExcelCell(c.secured_funding_potential || c.secured_lap_potential || ''),
        unsecured_od: sanitizeExcelCell(c.unsecured_funding_potential || c.unsecured_od_potential || ''),
        collateral: sanitizeExcelCell(c.potential_collateral_category || c.potential_collateral || ''),
        property_evidence: sanitizeExcelCell(c.property_ownership_information || c.property_ownership_evidence || ''),
        expansion_plans: sanitizeExcelCell(c.reported_expansion_plans || c.expansion_plans || ''),
        tier: sanitizeExcelCell(c.lead_priority_tier),
        score: c.qualification_score,
        status: sanitizeExcelCell(c.verification_status),
        source_batch: sanitizeExcelCell(c.import_batch_id || c.source_lineage_batch_id || 'BATCH-20261107-P5318')
      });
    });

    db.logAudit(req.portalUser.userId, 'EDUCATION', 'EXPORT_COLLEGES_DATABASE', { count: colleges.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="College_University_Funding_Master.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[CollegesExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate college export file.' });
  }
});

// 2. GET /api/portal/education/institutions/:id
router.get('/institutions/:id', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const instId = req.params.id;
  const institution = db.getById('education_institutions', instId);
  if (!institution) {
    return res.status(404).json({ success: false, message: 'Educational institution not found.' });
  }

  const contacts = db.find('education_contacts', c => c.institution_id === instId);
  const profiles = db.find('education_funding_profiles', f => f.institution_id === instId);
  const deals = db.find('education_pipeline', d => d.institution_id === instId);
  const consents = db.find('education_consent_records', c => c.institution_id === instId);

  return res.json({
    success: true,
    data: {
      ...institution,
      contacts,
      fundingProfiles: profiles,
      deals,
      consents
    }
  });
});

// 2b. POST /api/portal/education/institutions
router.post('/institutions', requirePortalAuth, requirePermission('education:write'), async (req, res) => {
  const { institution_id, institution_name, institution_category, city } = req.body || {};
  if (!institution_name || !institution_name.toString().trim() || !institution_category) {
    return res.status(400).json({ success: false, message: 'institution_name and institution_category are required.' });
  }

  const normalizedName = institution_name.toString().trim();
  const normalizedCategory = institution_category.toString().trim();
  const normalizedCity = (city || 'Maharashtra').toString().trim();
  const duplicate = db.findOne('education_institutions', i =>
    safeLower(i.institution_name).trim() === normalizedName.toLowerCase() &&
    safeLower(i.city).trim() === normalizedCity.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: `Duplicate institution record exists (${duplicate.institution_id}) for ${normalizedName} in ${normalizedCity}.`
    });
  }

  const newId = institution_id && institution_id.toString().trim()
    ? institution_id.toString().trim()
    : `ALS-EDU-${Date.now().toString(36).toUpperCase()}`;

  // APR006-P5-03: Strict allowlist + force Unverified_Pending & provenance on creation
  const safeFields = pickAllowedEducationFields(req.body);
  const created = await db.upsertAsync('education_institutions', 'institution_id', {
    ...safeFields,
    institution_id: newId,
    institution_name: normalizedName,
    institution_category: normalizedCategory,
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

  db.logAudit(req.portalUser.userId, 'EDUCATION', 'CREATE_EDUCATION_INSTITUTION', { institution_id: newId, institution_name: normalizedName }, req.ip);

  return res.status(201).json({ success: true, message: 'Institution record created successfully.', data: created });
});

// 3. PUT /api/portal/education/institutions/:id
router.put('/institutions/:id', requirePortalAuth, requirePermission('education:write'), async (req, res) => {
  const instId = req.params.id;
  const existing = db.getById('education_institutions', instId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Educational institution not found.' });
  }

  // APR006-P5-03: Strict allowlist (no mass-assignment)
  const safeFields = pickAllowedEducationFields(req.body);
  if (req.body && req.body.institution_name && String(req.body.institution_name).trim()) {
    safeFields.institution_name = String(req.body.institution_name).trim();
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

  const updated = await db.upsertAsync('education_institutions', 'institution_id', {
    ...existing,
    ...safeFields,
    institution_id: instId,
    updated_at: new Date().toISOString()
  });

  db.logAudit(req.portalUser.userId, 'EDUCATION', 'UPDATE_EDUCATION_INSTITUTION', { institution_id: instId, changes: Object.keys(safeFields) }, req.ip);

  return res.json({ success: true, message: 'Institution record updated successfully.', data: updated });
});

// 4. GET /api/portal/education/aplus
router.get('/aplus', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { segment } = req.query;
  const institutions = db.getAll('education_institutions');
  const fundingProfiles = db.getAll('education_funding_profiles');
  const profileByInst = new Map(fundingProfiles.map(p => [p.institution_id, p]));
  const aPlus = institutions.filter(i => i.lead_priority_tier === 'A+');

  // APR006-P5-02: Null-safe string helpers & actual record counts (zero fabricated multipliers)
  const hasSecuredPotential = (i) => {
    const profile = profileByInst.get(i.institution_id);
    const cats = (profile && Array.isArray(profile.funding_categories)) ? profile.funding_categories.map(safeLower) : [];
    const cls = safeLower(i.funding_classification_type);
    return Boolean(
      (i.secured_funding_potential && String(i.secured_funding_potential).trim()) ||
      (i.secured_lap_potential && String(i.secured_lap_potential).trim()) ||
      (/\bsecured\b/.test(cls) && !cls.includes('only unsecured')) ||
      cats.some(c => c.includes('secured') || c.includes('loan against property') || c.includes('land and building'))
    );
  };

  const hasUnsecuredPotential = (i) => {
    const profile = profileByInst.get(i.institution_id);
    const cats = (profile && Array.isArray(profile.funding_categories)) ? profile.funding_categories.map(safeLower) : [];
    const cls = safeLower(i.funding_classification_type);
    return Boolean(
      (i.unsecured_funding_potential && String(i.unsecured_funding_potential).trim()) ||
      (i.unsecured_od_potential && String(i.unsecured_od_potential).trim()) ||
      cls.includes('unsecured') ||
      cats.some(c => c.includes('unsecured') || c.includes('working capital'))
    );
  };

  let filtered = aPlus;
  if (segment) {
    const s = safeLower(segment);
    if (s.includes('mh') || s.includes('maharashtra')) {
      filtered = filtered.filter(i => safeLower(i.state) === 'maharashtra');
    } else if (s.includes('national')) {
      filtered = filtered.filter(i => safeLower(i.state) !== 'maharashtra');
    }
    if (s.includes('school')) {
      filtered = filtered.filter(i => safeLower(i.institution_category).includes('school'));
    } else if (s.includes('college')) {
      filtered = filtered.filter(i => safeLower(i.institution_category).includes('college') || safeLower(i.institution_category).includes('university'));
    } else if (s.includes('trust')) {
      filtered = filtered.filter(i => safeLower(i.ownership_type).includes('trust') || (i.parent_trust_society && String(i.parent_trust_society).length > 0));
    }
  }

  // Count segments strictly from actual record attributes
  const segmentsCount = {
    'A+ Maharashtra Schools': aPlus.filter(i => safeLower(i.state) === 'maharashtra' && safeLower(i.institution_category).includes('school')).length,
    'A+ Maharashtra Colleges': aPlus.filter(i => safeLower(i.state) === 'maharashtra' && (safeLower(i.institution_category).includes('college') || safeLower(i.institution_category).includes('university'))).length,
    'A+ Maharashtra Educational Trusts': aPlus.filter(i => safeLower(i.state) === 'maharashtra' && safeLower(i.ownership_type).includes('trust')).length,
    'A+ National Schools': aPlus.filter(i => safeLower(i.state) !== 'maharashtra' && safeLower(i.institution_category).includes('school')).length,
    'A+ National Colleges': aPlus.filter(i => safeLower(i.state) !== 'maharashtra' && (safeLower(i.institution_category).includes('college') || safeLower(i.institution_category).includes('university'))).length,
    'A+ National Educational Trusts': aPlus.filter(i => safeLower(i.state) !== 'maharashtra' && safeLower(i.ownership_type).includes('trust')).length,
    'A+ Secured Funding': aPlus.filter(hasSecuredPotential).length,
    'A+ Unsecured Funding': aPlus.filter(hasUnsecuredPotential).length
  };

  return res.json({
    success: true,
    totalAPlus: aPlus.length,
    filteredCount: filtered.length,
    funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
    is_estimate_not_revenue: true,
    segments: segmentsCount,
    data: filtered
  });
});

// 5. GET /api/portal/education/pipeline
router.get('/pipeline', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const deals = db.getAll('education_pipeline');
  const institutions = db.getAll('education_institutions');
  const instMap = new Map(institutions.map(i => [i.institution_id, i]));

  const enrichedDeals = deals.map(d => ({
    ...d,
    institution: instMap.get(d.institution_id) || {},
    is_estimate_not_revenue: !(Number(d.stage) >= 19 && Number(d.sanctioned_amount) > 0)
  }));

  const grouped = {};
  STAGES.forEach(s => {
    grouped[s.id] = {
      stageId: s.id,
      stageName: s.name,
      deals: enrichedDeals.filter(d => d.stage === s.id)
    };
  });

  // APR006-P5-05: Explicitly separate preliminary estimated pipeline vs confirmed sanctioned/disbursed amounts
  let preliminaryEstimatedPipelineInr = 0;
  let confirmedSanctionedDeals = 0;
  let confirmedSanctionedInr = 0;
  let confirmedDisbursedDeals = 0;
  let confirmedDisbursedInr = 0;

  deals.forEach(d => {
    const reqAmt = Number(d.funding_requested);
    if (Number.isFinite(reqAmt) && reqAmt > 0) preliminaryEstimatedPipelineInr += reqAmt;

    const hasVerifiedLender = Boolean(d.lender_name && String(d.lender_name).trim() && d.lender_name !== 'Pending Lender Matching');
    const sancAmt = Number(d.sanctioned_amount);
    if (Number(d.stage) >= 19 && hasVerifiedLender && Number.isFinite(sancAmt) && sancAmt > 0) {
      confirmedSanctionedDeals++;
      confirmedSanctionedInr += sancAmt;
    }
    const disbAmt = Number(d.disbursed_amount);
    if (Number(d.stage) >= 21 && hasVerifiedLender && Number.isFinite(disbAmt) && disbAmt > 0) {
      confirmedDisbursedDeals++;
      confirmedDisbursedInr += disbAmt;
    }
  });

  return res.json({
    success: true,
    stages: STAGES,
    grouped,
    totalDeals: deals.length,
    pipeline_summary: {
      total_deals: deals.length,
      preliminary_estimated_pipeline_inr: preliminaryEstimatedPipelineInr,
      confirmed_sanctioned_deals: confirmedSanctionedDeals,
      confirmed_sanctioned_inr: confirmedSanctionedInr,
      confirmed_disbursed_deals: confirmedDisbursedDeals,
      confirmed_disbursed_inr: confirmedDisbursedInr,
      is_estimate_not_revenue: true,
      disclaimer: FUNDING_ESTIMATE_DISCLAIMER
    }
  });
});

// 6. PUT /api/portal/education/pipeline/:dealId/stage
router.put('/pipeline/:dealId/stage', requirePortalAuth, requirePermission('education:write'), (req, res) => {
  const dealId = req.params.dealId;
  const { stage, stage_name, notes, lender_name, sanctioned_amount, disbursed_amount } = req.body || {};

  // APR006-P5-03: Strictly validate integer stage 1..24 and non-negative numeric amounts
  const newStage = Number(stage);
  if (!Number.isInteger(newStage) || newStage < 1 || newStage > 24) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pipeline stage. Must be an integer between 1 and 24.'
    });
  }

  if (sanctioned_amount !== undefined) {
    const parsedSanction = Number(sanctioned_amount);
    if (!Number.isFinite(parsedSanction) || parsedSanction < 0) {
      return res.status(400).json({ success: false, message: 'sanctioned_amount must be a non-negative number.' });
    }
    if (parsedSanction > 0 && newStage < 19) {
      return res.status(400).json({ success: false, message: 'Policy Violation: sanctioned_amount cannot be positive before Stage 19 (Sanctioned).' });
    }
  }

  if (disbursed_amount !== undefined) {
    const parsedDisbursed = Number(disbursed_amount);
    if (!Number.isFinite(parsedDisbursed) || parsedDisbursed < 0) {
      return res.status(400).json({ success: false, message: 'disbursed_amount must be a non-negative number.' });
    }
    if (parsedDisbursed > 0 && newStage < 21) {
      return res.status(400).json({ success: false, message: 'Policy Violation: disbursed_amount cannot be positive before Stage 21 (Disbursed).' });
    }
  }

  const deal = db.getById('education_pipeline', dealId);
  if (!deal) {
    return res.status(404).json({ success: false, message: 'Pipeline deal not found.' });
  }

  // Strict enforcement: Never represent a lead as approved or sanctioned without verified lender evidence
  const effectiveLender = lender_name !== undefined ? String(lender_name).trim() : String(deal.lender_name || '').trim();
  if (newStage >= 19 && (!effectiveLender || effectiveLender === 'Pending Lender Matching')) {
    return res.status(400).json({
      success: false,
      message: 'Policy Violation: Stage 19+ (Sanctioned/Disbursed) requires verified lender evidence and lender name.'
    });
  }

  const prevStage = deal.stage;
  deal.stage = newStage;
  if (stage_name) deal.stage_name = String(stage_name).trim();
  if (lender_name) deal.lender_name = String(lender_name).trim();
  if (sanctioned_amount !== undefined) deal.sanctioned_amount = Number(sanctioned_amount);
  if (disbursed_amount !== undefined) deal.disbursed_amount = Number(disbursed_amount);
  if (notes) deal.notes = (deal.notes ? deal.notes + '\n' : '') + `[${new Date().toISOString().split('T')[0]}] Stage changed to ${newStage}: ${String(notes)}`;
  deal.updated_at = new Date().toISOString();

  db.upsert('education_pipeline', 'deal_id', deal);
  db.logAudit(req.portalUser.userId, 'EDUCATION', 'PIPELINE_STAGE_CHANGE', { dealId, fromStage: prevStage, toStage: deal.stage, lender: deal.lender_name }, req.ip);

  return res.json({ success: true, message: 'Education pipeline stage updated.', data: deal });
});

// 7. GET /api/portal/education/funding-categories
router.get('/funding-categories', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const profiles = db.getAll('education_funding_profiles');
  const counts = {};
  FUNDING_CATEGORIES.forEach(fc => {
    counts[fc] = profiles.filter(p => p.funding_categories && p.funding_categories.includes(fc)).length;
  });

  return res.json({ success: true, categories: FUNDING_CATEGORIES, counts });
});

// 8. GET /api/portal/education/consent
router.get('/consent', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const records = db.getAll('education_consent_records');
  const institutions = db.getAll('education_institutions');
  const instMap = new Map(institutions.map(i => [i.institution_id, i]));

  const enriched = records.map(r => ({
    ...r,
    institution: instMap.get(r.institution_id) || {}
  }));

  const summary = {
    total: records.length,
    granted: records.filter(r => r.consent_status === 'Granted').length,
    pending: records.filter(r => r.consent_status === 'Pending_Request').length,
    optedOut: records.filter(r => r.consent_status === 'Opted_Out').length,
    revoked: records.filter(r => r.consent_status === 'Revoked').length
  };

  return res.json({ success: true, summary, data: enriched });
});

// 9. PUT /api/portal/education/consent/:id
router.put('/consent/:id', requirePortalAuth, requirePermission('education:write'), (req, res) => {
  const consentId = req.params.id;
  const { consent_status, suppression_reason, cadence_step } = req.body || {};

  // APR006-P5-03: Strict consent_status enum validation
  if (!consent_status || !VALID_CONSENT_STATUSES.has(consent_status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid consent_status. Allowed values: ${Array.from(VALID_CONSENT_STATUSES).join(', ')}.`
    });
  }

  const existing = db.getById('education_consent_records', consentId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Consent record not found.' });
  }

  existing.consent_status = consent_status;
  if (suppression_reason !== undefined) existing.suppression_reason = suppression_reason ? String(suppression_reason) : null;
  if (cadence_step !== undefined) {
    const parsedStep = Number(cadence_step);
    if (!Number.isInteger(parsedStep) || parsedStep < 0) {
      return res.status(400).json({ success: false, message: 'cadence_step must be a non-negative integer.' });
    }
    existing.cadence_step = parsedStep;
  }

  if (consent_status === 'Granted') {
    existing.opt_in_timestamp = new Date().toISOString();
  } else if (consent_status === 'Opted_Out' || consent_status === 'Revoked') {
    existing.opt_out_timestamp = new Date().toISOString();
  }
  existing.updated_at = new Date().toISOString();

  db.upsert('education_consent_records', 'consent_id', existing);
  db.logAudit(req.portalUser.userId, 'EDUCATION', 'UPDATE_CONSENT_STATUS', { consentId, newStatus: consent_status }, req.ip);

  return res.json({ success: true, message: 'Consent status updated.', data: existing });
});

// 10. GET /api/portal/education/export
router.get('/export', requirePortalAuth, requirePermission('education:export'), async (req, res) => {
  try {
    const institutions = db.getAll('education_institutions');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Education Institutions');

    worksheet.columns = [
      { header: 'Institution ID', key: 'institution_id', width: 22 },
      { header: 'Institution Name', key: 'institution_name', width: 38 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Ownership Type', key: 'ownership', width: 22 },
      { header: 'Parent Trust / Society', key: 'parent_trust', width: 30 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Chairman / Chancellor', key: 'chairman_name', width: 25 },
      { header: 'Chairman Mobile', key: 'chairman_mobile', width: 20 },
      { header: 'Secretary / Trustee', key: 'secretary_name', width: 25 },
      { header: 'Principal / Director', key: 'director_name', width: 25 },
      { header: 'Finance Head / CFO', key: 'finance_head_name', width: 22 },
      { header: 'Website', key: 'website', width: 30 },
      { header: 'Official Telephone', key: 'telephone', width: 20 },
      { header: 'Official Email', key: 'email', width: 30 },
      { header: 'Funding Requirement', key: 'funding_req', width: 25 },
      { header: 'Borrowing Capacity', key: 'borrowing_capacity', width: 24 },
      { header: 'Secured LAP Potential', key: 'secured_lap', width: 24 },
      { header: 'Unsecured OD Potential', key: 'unsecured_od', width: 24 },
      { header: 'Potential Collateral', key: 'collateral', width: 25 },
      { header: 'Property Evidence', key: 'property_evidence', width: 22 },
      { header: 'Expansion Plans', key: 'expansion_plans', width: 35 },
      { header: 'Priority Tier', key: 'tier', width: 15 },
      { header: 'Score (100-Pt)', key: 'score', width: 15 },
      { header: 'Source Lineage Batch', key: 'source_batch', width: 25 }
    ];

    institutions.forEach(i => {
      const lg = i.leadership_governance || {};
      worksheet.addRow({
        institution_id: sanitizeExcelCell(i.institution_id),
        institution_name: sanitizeExcelCell(i.institution_name),
        category: sanitizeExcelCell(i.institution_category),
        ownership: sanitizeExcelCell(i.ownership_type),
        parent_trust: sanitizeExcelCell(i.parent_trust_society),
        city: sanitizeExcelCell(i.city),
        state: sanitizeExcelCell(i.state),
        chairman_name: sanitizeExcelCell(lg.chairman_name || i.chairman_name || ''),
        chairman_mobile: sanitizeExcelCell(lg.professional_mobile || i.chairman_mobile || ''),
        secretary_name: sanitizeExcelCell(lg.secretary_name || lg.managing_trustee_name || i.secretary_name || ''),
        director_name: sanitizeExcelCell(lg.director_name || i.director_name || ''),
        finance_head_name: sanitizeExcelCell(lg.finance_head_name || i.finance_head_name || ''),
        website: sanitizeExcelCell(i.institution_website || i.website),
        telephone: sanitizeExcelCell(i.official_telephone),
        email: sanitizeExcelCell(i.official_email),
        funding_req: sanitizeExcelCell(i.potential_funding_requirement),
        borrowing_capacity: sanitizeExcelCell(i.potential_borrowing_capacity || i.potential_funding_requirement || ''),
        secured_lap: sanitizeExcelCell(i.secured_funding_potential || i.secured_lap_potential || ''),
        unsecured_od: sanitizeExcelCell(i.unsecured_funding_potential || i.unsecured_od_potential || ''),
        collateral: sanitizeExcelCell(i.potential_collateral_category || i.potential_collateral || ''),
        property_evidence: sanitizeExcelCell(i.property_ownership_information || i.property_ownership_evidence || ''),
        expansion_plans: sanitizeExcelCell(i.reported_expansion_plans || i.expansion_plans || ''),
        tier: sanitizeExcelCell(i.lead_priority_tier),
        score: i.qualification_score,
        source_batch: sanitizeExcelCell(i.import_batch_id || i.source_lineage_batch_id || 'BATCH-20261107-P5318')
      });
    });

    db.logAudit(req.portalUser.userId, 'EDUCATION', 'EXPORT_EDUCATION_DATA', { count: institutions.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Education_Institution_Master.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[EducationExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate export file.' });
  }
});

// 11. POST /api/portal/education/institutions/:id/crm-handover
// Controlled Qualified Institutional Prospect -> AVANI AI CRM Handover (Sections 7, 10, 15)
router.post('/institutions/:id/crm-handover', requirePortalAuth, requirePermission('education:write'), async (req, res) => {
  try {
    const institutionId = req.params.id;
    const institution = db.getById('education_institutions', institutionId);
    if (!institution) {
      return res.status(404).json({ success: false, code: 'INSTITUTION_NOT_FOUND', message: 'Education institution not found.' });
    }

    const body = req.body || {};

    // 1. Check institutional consent record in education_consent_records + request body
    const consentRecords = db.getAll('education_consent_records').filter(r => r.institution_id === institutionId);
    const latestConsentRecord = consentRecords[0] || null;
    if (
      latestConsentRecord &&
      (latestConsentRecord.consent_status === 'Opted_Out' || latestConsentRecord.consent_status === 'Revoked')
    ) {
      return res.status(403).json({
        success: false,
        code: 'INSTITUTION_OPTED_OUT',
        message: 'CRM handover blocked: This institution has opted out or revoked communication permission.'
      });
    }

    const hasExplicitConsent =
      body.consent === true ||
      body.consentStatus === 'GRANTED' ||
      (latestConsentRecord && latestConsentRecord.consent_status === 'Granted');

    if (!hasExplicitConsent) {
      return res.status(403).json({
        success: false,
        code: 'CONSENT_REQUIRED',
        message: 'CRM handover blocked: Explicit institutional communication permission is required before transferring an institutional funding opportunity to AVANI AI CRM.'
      });
    }

    // 2. Verify institution or contact verification status
    const contacts = db.getAll('education_contacts').filter(c => c.institution_id === institutionId && isVerifiedEducationContact(c));
    const isInstVerified = safeLower(institution.verification_status).trim() === 'verified';
    if (!isInstVerified && contacts.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'UNVERIFIED_INSTITUTION_PROSPECT',
        message: 'CRM handover blocked: Institution or authorized leadership contact must be verified before CRM handover.'
      });
    }

    const lg = institution.leadership_governance || {};
    const primaryContact = contacts[0] || {};
    const contactName = String(
      body.contact_person ||
      primaryContact.full_name ||
      primaryContact.contact_name ||
      lg.chairman_name ||
      lg.secretary_name ||
      lg.director_name ||
      institution.chairman_name ||
      institution.institution_name
    ).trim();

    const rawPhone = String(
      body.phone ||
      body.telephone ||
      primaryContact.mobile ||
      primaryContact.phone ||
      lg.professional_mobile ||
      institution.chairman_mobile ||
      institution.official_telephone ||
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

    const loanCategory = isSchool(institution) ? 'School Funding' : 'College Funding';
    const requestedAmount = body.requestedAmount ?? body.estimated_amount ?? 50000000;
    const idempotencyKey = String(body.idempotencyKey || `EDU-CRM-${institutionId}`).trim().slice(0, 64);
    const provenanceBatchId = institution.import_batch_id || institution.source_lineage_batch_id || 'BATCH-20261107-P5318';

    const crmPayload = {
      name: `${contactName} (${institution.institution_name})`.slice(0, 110),
      phone: `+91${raw10}`,
      city: String(institution.city || 'Latur').trim(),
      loanType: loanCategory,
      requestedAmount: String(requestedAmount),
      leadSource: 'INSTITUTIONAL_DATABASE_HANDOVER',
      consent: true,
      consentStatus: 'GRANTED',
      idempotencyKey,
      sourceProject: 'PROJECT_A_UNIFIED_PORTAL',
      sourceModule: 'INSTITUTIONAL_DATABASE',
      sourceRecordId: institutionId,
      provenanceBatchId,
      is_estimate_not_revenue: true,
      funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER
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
          message: (resp.data && resp.data.message) || 'AVANI AI CRM rejected the institutional funding handover request.'
        });
      }
      crmResponse = resp.data;
    }

    db.logAudit(
      req.portalUser.userId,
      'EDUCATION',
      'INSTITUTIONAL_CRM_HANDOVER',
      {
        institutionId,
        loanCategory,
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
      sourceModule: 'INSTITUTIONAL_DATABASE',
      institution_id: institutionId,
      loanCategory,
      provenanceBatchId,
      idempotencyKey,
      is_estimate_not_revenue: true,
      funding_estimate_disclaimer: FUNDING_ESTIMATE_DISCLAIMER,
      crmPayload,
      crmResult: crmResponse
    });
  } catch (err) {
    console.error('[EducationCrmHandover] Error:', err.message);
    return res.status(502).json({
      success: false,
      code: 'CRM_HANDOVER_UNAVAILABLE',
      message: 'Unable to reach AVANI AI CRM for institutional funding opportunity handover.'
    });
  }
});

router._helpers = {
  safeLower,
  parsePagination,
  sanitizeExcelCell,
  pickAllowedEducationFields,
  isVerifiedEducationContact,
  FUNDING_ESTIMATE_DISCLAIMER
};

module.exports = router;
