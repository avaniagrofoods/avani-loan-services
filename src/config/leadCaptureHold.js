// src/config/leadCaptureHold.js
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — TEMPORARY LEAD CAPTURE HOLD CONFIGURATION (APR-033)
// Governs temporary website containment during canonical CRM verification.
// Configurable via LEAD_CAPTURE_HOLD / VITE_LEAD_CAPTURE_HOLD environment variables.
// Defaults safely to TRUE (Hold Active) to prevent unverified data transmission.
// ─────────────────────────────────────────────────────────────────────────────

import { OFFICIAL_BUSINESS } from './officialBusiness.js';

export function isLeadCaptureHoldActive() {
  if (typeof process !== 'undefined' && process.env && process.env.LEAD_CAPTURE_HOLD === 'false') {
    return false;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LEAD_CAPTURE_HOLD === 'false') {
    return false;
  }
  return true;
}

export const HOLD_CONTACT_INFO = Object.freeze({
  phone: OFFICIAL_BUSINESS.phoneDisplay,
  phoneE164: OFFICIAL_BUSINESS.phoneE164,
  telHref: OFFICIAL_BUSINESS.telHref,
  whatsappUrl: OFFICIAL_BUSINESS.whatsappUrl,
  email: OFFICIAL_BUSINESS.email,
  emailHref: OFFICIAL_BUSINESS.emailHref,
  websiteUrl: OFFICIAL_BUSINESS.websiteUrl,
  website: OFFICIAL_BUSINESS.websiteUrl,
  advisorName: OFFICIAL_BUSINESS.owner,
  advisorTitle: OFFICIAL_BUSINESS.ownerTitle,
  title: 'Online Enquiry Submission Temporarily Unavailable',
  badge: 'Scheduled Systems Maintenance',
  message:
    'Online automated enquiry submission is temporarily unavailable while our canonical CRM destination verification is in progress. Your entered details have been retained on this screen. To proceed immediately without delay, please connect directly with our advisory desk:',
  privacyNotice:
    'No personal or financial information is transmitted to third-party services. You may contact us directly via WhatsApp, phone, or email at your discretion.'
});
