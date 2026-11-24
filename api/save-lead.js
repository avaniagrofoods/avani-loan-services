import axios from 'axios';

// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE WEBSITE LEAD INTAKE API
// Endpoint: POST /api/save-lead
// Conforms to Cross-Workspace Integration Contracts (Version 1.0.0)
// Validates DPDP consent, normalizes mobile, prevents duplicate submissions,
// captures UTM attribution, and forwards securely to AVANI AI CRM.
// ─────────────────────────────────────────────────────────────────

const inMemoryIdempotencyCache = new Map();
const IDEMPOTENCY_WINDOW_MS = 30000;
const IDEMPOTENCY_TTL_MS = 300000;
const IDEMPOTENCY_MAX_ENTRIES = 1000;

export function isValidOptionalEmail(email) {
  if (!email) return true;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function pruneIdempotencyCache(now = Date.now(), cache = inMemoryIdempotencyCache, maxEntries = IDEMPOTENCY_MAX_ENTRIES) {
  for (const [k, v] of cache.entries()) {
    if (!v || (now - v.timestamp > IDEMPOTENCY_TTL_MS)) {
      cache.delete(k);
    }
  }
  while (cache.size >= maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
  return cache.size;
}

export function normalizeIndianPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^0-9]/g, '');
  const raw10 = digits.length > 10 ? digits.slice(-10) : digits;
  if (raw10.length !== 10 || !/^[6-9]/.test(raw10)) return null;
  return {
    formatted: `+91${raw10}`,
    raw10
  };
}

function normalizeLoanCategory(loanType) {
  const norm = String(loanType || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (norm.includes('DOCTOR') || norm.includes('MEDIC')) return 'DOCTOR_LOAN';
  if (norm.includes('BUSIN') || norm.includes('COMMERC') || norm.includes('MSME')) return 'BUSINESS_LOAN';
  if (norm.includes('MORTG') || norm.includes('LAP') || norm.includes('AGAINSTPROP')) return 'MORTGAGE_LOAN';
  if (norm.includes('HOME') || norm.includes('HOUS')) return 'HOME_LOAN';
  if (norm.includes('GLOBAL') || norm.includes('ABROAD') || norm.includes('OVERSEA')) return 'EDUCATION_LOAN_GLOBAL';
  if (norm.includes('EDU') || norm.includes('STUD')) return 'EDUCATION_LOAN_INDIA';
  if (norm.includes('SCHOOL') || norm.includes('COLLEGE') || norm.includes('INSTITUT')) return 'SCHOOL_COLLEGE_FUNDING';
  return 'PERSONAL_LOAN';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const correlationId = `CORR-WEB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  res.setHeader('X-Correlation-Id', correlationId);

  try {
    const raw = req.body || {};
    const name = (raw.name || raw.fullName || '').trim();
    const rawPhone = raw.phone || raw.mobile || raw.whatsapp || '';
    const rawLoanType = raw.loanType || raw.loanProduct || raw.product || 'Personal Loan';
    const email = (raw.email || '').trim();
    const city = (raw.city || 'Latur').trim();
    const state = (raw.state || 'Maharashtra').trim();

    // 1. Mandatory Fields Validation
    if (!name || !rawPhone) {
      return res.status(400).json({
        success: false,
        correlationId,
        error: 'Name and valid phone number are required.'
      });
    }

    // 2. Phone Number Normalization & Optional Email Format Validation
    const phoneData = normalizeIndianPhone(rawPhone);
    if (!phoneData) {
      return res.status(400).json({
        success: false,
        correlationId,
        error: 'Invalid mobile number. Please provide a valid 10-digit Indian mobile number.'
      });
    }

    if (!isValidOptionalEmail(email)) {
      return res.status(400).json({
        success: false,
        correlationId,
        error: 'Invalid email address format.'
      });
    }

    // 3. DPDP Act Explicit Affirmative Consent Check (APR006-P1-01)
    const normalizedConsentStatus = String(raw.consentStatus || '').trim().toUpperCase();
    const consentExplicitlyDenied =
      raw.consent === false ||
      normalizedConsentStatus === 'DENIED' ||
      normalizedConsentStatus === 'REVOKED' ||
      normalizedConsentStatus === 'OPTED_OUT';
    const consentExplicitlyGranted =
      raw.consent === true || normalizedConsentStatus === 'GRANTED';
    const consentGranted = !consentExplicitlyDenied && consentExplicitlyGranted;
    if (!consentGranted) {
      return res.status(403).json({
        success: false,
        correlationId,
        error: 'DPDP Act Consent required: explicit affirmative applicant consent is required before processing.'
      });
    }

    // 4. Duplicate Suppression / Idempotency Check
    const idempotencyKey = raw.idempotencyKey || `IDEMP-${phoneData.raw10}-${Date.now()}`;
    const cacheKey = `${phoneData.raw10}-${raw.idempotencyKey || ''}`;
    const now = Date.now();
    const cached = inMemoryIdempotencyCache.get(cacheKey);

    if (cached && (now - cached.timestamp < IDEMPOTENCY_WINDOW_MS)) { // 30-second deduplication window
      return res.status(200).json({
        success: true,
        correlationId,
        idempotencyHit: true,
        leadId: cached.leadId,
        message: 'Duplicate submission absorbed safely. Your enquiry is already being processed.',
        status: 'RECEIVED'
      });
    }
    if (cached && (now - cached.timestamp >= IDEMPOTENCY_TTL_MS)) {
      inMemoryIdempotencyCache.delete(cacheKey);
    }

    const canonicalLoanCategory = normalizeLoanCategory(rawLoanType);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const leadId = raw.leadId || `AVL-${dateStr}-${Math.floor(100000 + Math.random() * 900000)}`;

    const crmPayload = {
      leadId,
      name,
      phone: phoneData.formatted,
      email,
      city,
      state,
      loanType: canonicalLoanCategory,
      requestedAmount: raw.amount || raw.requestedAmount || '',
      monthlyIncome: raw.monthlyIncome || '',
      employmentType: raw.employmentType || raw.customerProfile || 'Salaried',
      preferredLanguage: raw.preferredLanguage || 'English',
      leadSource: raw.source || raw.utm_source || 'WEBSITE',
      campaign: raw.campaign || raw.utm_campaign || 'DIRECT',
      campaignId: raw.campaignId || raw.c || '',
      utmSource: raw.utm_source || raw.utmSource || 'website',
      utmMedium: raw.utm_medium || raw.utmMedium || 'web_form',
      utmCampaign: raw.utm_campaign || raw.utmCampaign || '',
      utmContent: raw.utm_content || raw.utmContent || '',
      utmTerm: raw.utm_term || raw.utmTerm || '',
      consentStatus: 'GRANTED',
      consentPurpose: 'LOAN_ELIGIBILITY_PROCESSING',
      consentTimestamp: new Date().toISOString(),
      idempotencyKey,
      correlationId
    };

    const syncResults = {
      crm: false,
      googleWebApp: false,
      pabbly: false,
      pickyAssist: false
    };

    // 5. Forward to AVANI AI CRM (Dedicated Public Enquiry Intake API)
    const CRM_BASE_URL = process.env.AVANI_CRM_URL || process.env.NEXT_PUBLIC_CRM_URL || 'https://avani-ai-crm.vercel.app';
    let resolvedLeadId = leadId;

    try {
      const crmHeaders = { 'Content-Type': 'application/json' };
      const crmRes = await axios.post(`${CRM_BASE_URL}/api/public/enquiry`, {
        ...crmPayload,
        privacyPolicyVersion: raw.privacyPolicyVersion || 'DPDP-2026-v1',
        consent: true
      }, {
        headers: crmHeaders,
        timeout: 8000
      });
      if ((crmRes.status === 200 || crmRes.status === 201) && crmRes.data?.success) {
        syncResults.crm = true;
        if (crmRes.data.leadId) resolvedLeadId = crmRes.data.leadId;
      }
    } catch (crmErr) {
      console.warn('[LeadIntake] AVANI AI CRM sync warning:', crmErr.message);
      // Non-blocking: downstream fallbacks will retain lead record
    }

    // 6. Secondary Partner Webhooks (Picky Assist, Google Sheet, Pabbly)
    const PICKY_ASSIST_URL = process.env.PICKY_ASSIST_URL || "";
    const GOOGLE_SHEET_APP_SCRIPT_URL = process.env.GOOGLE_SHEET_APP_SCRIPT_URL || process.env.GOOGLE_WEB_APP_URL || "";
    const PABBLY_CONNECT_URL = process.env.PABBLY_CONNECT_URL || process.env.ZAPIER_WEBHOOK_URL || "";

    if (PICKY_ASSIST_URL) {
      try {
        await axios.post(PICKY_ASSIST_URL, crmPayload, { timeout: 5000 });
        syncResults.pickyAssist = true;
      } catch (err) { /* non-fatal */ }
    }

    if (GOOGLE_SHEET_APP_SCRIPT_URL) {
      try {
        await axios.post(GOOGLE_SHEET_APP_SCRIPT_URL, crmPayload, { timeout: 5000 });
        syncResults.googleWebApp = true;
      } catch (err) { /* non-fatal */ }
    }

    if (PABBLY_CONNECT_URL) {
      try {
        await axios.post(PABBLY_CONNECT_URL, crmPayload, { timeout: 5000 });
        syncResults.pabbly = true;
      } catch (err) { /* non-fatal */ }
    }

    // Prune expired / cap bounded cache size before inserting (APR006-P1-02)
    pruneIdempotencyCache(now, inMemoryIdempotencyCache, IDEMPOTENCY_MAX_ENTRIES);

    // APR-025 P1-FIX: Fail closed — NEVER claim success if canonical Google Sheets CRM handover failed!
    const canonicalPersisted = Boolean(syncResults.crm || syncResults.googleWebApp);
    if (!canonicalPersisted) {
      return res.status(503).json({
        success: false,
        persisted: false,
        leadId: resolvedLeadId,
        correlationId,
        status: 'HANDOVER_UNAVAILABLE',
        syncResults,
        error: 'CANONICAL_HANDOVER_FAILED',
        message: 'We could not confirm registration of your enquiry with our CRM right now. Please try again in a moment or contact us directly on WhatsApp at +91 91756 35165.'
      });
    }

    // Cache idempotency entry ONLY after canonical handover is acknowledged
    inMemoryIdempotencyCache.set(cacheKey, { leadId: resolvedLeadId, timestamp: now });

    return res.status(200).json({
      success: true,
      persisted: true,
      leadId: resolvedLeadId,
      correlationId,
      status: 'RECEIVED',
      productCategory: canonicalLoanCategory,
      assignedAdvisor: 'Sachin Shinde',
      syncResults,
      acknowledged: true,
      message: 'Thank you for contacting AVANI LOAN SERVICES. Your enquiry has been received and routed to our Senior Loan Advisor.'
    });

  } catch (error) {
    console.error('[LeadIntake] Internal Error:', error.message);
    return res.status(500).json({
      success: false,
      correlationId,
      error: 'An unexpected error occurred while processing your enquiry. Please contact +91 91756 35165.'
    });
  }
}
