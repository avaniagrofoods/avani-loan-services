// src/lib/syncLeads.js
// Privacy-first client lead submission helper:
// - Zero hardcoded Make.com or Google Apps Script URLs
// - Zero console logging of personal information (PII)
// - Requires explicit user consent before network submission

export const syncLeadData = async (data) => {
  if (!data || data.consent !== true) {
    return { ok: false, reason: 'EXPLICIT_CONSENT_REQUIRED' };
  }

  const sanitizedPayload = {
    name: String(data.name || '').trim(),
    phone: String(data.phone || '').trim(),
    email: String(data.email || '').trim(),
    loanType: String(data.loanType || '').trim(),
    amount: String(data.amount || '').trim(),
    city: String(data.city || '').trim(),
    consent: true,
    consentTimestamp: new Date().toISOString(),
    source: String(data.source || 'Website_Enquiry').trim()
  };

  try {
    const response = await fetch('/api/save-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedPayload)
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, reason: 'NETWORK_UNAVAILABLE' };
  }
};
