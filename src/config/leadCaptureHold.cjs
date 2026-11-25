// src/config/leadCaptureHold.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — TEMPORARY LEAD CAPTURE HOLD CONFIGURATION (APR-033)
// CommonJS counterpart for Express routes and serverless handlers
// ─────────────────────────────────────────────────────────────────────────────

function isLeadCaptureHoldActive() {
  if (process.env.LEAD_CAPTURE_HOLD === 'false') {
    return false;
  }
  return true;
}

const HOLD_CONTACT_INFO = Object.freeze({
  phone: '+91 91756 35165',
  phoneE164: '+919175635165',
  telHref: 'tel:+919175635165',
  whatsappUrl: 'https://wa.me/919175635165',
  email: 'enquiry@avanifinserv.com',
  emailHref: 'mailto:enquiry@avanifinserv.com',
  websiteUrl: 'https://www.avanifinserv.com',
  website: 'https://www.avanifinserv.com',
  advisorName: 'Sachin Shinde',
  advisorTitle: 'Founder & Owner, Senior Loan Advisor',
  title: 'Online Enquiry Submission Temporarily Unavailable',
  badge: 'Scheduled Systems Maintenance',
  message:
    'Online automated enquiry submission is temporarily unavailable while our canonical CRM destination verification is in progress. Your entered details have been retained on this screen. To proceed immediately without delay, please connect directly with our advisory desk:',
  privacyNotice:
    'No personal or financial information is transmitted to third-party services. You may contact us directly via WhatsApp, phone, or email at your discretion.'
});

module.exports = {
  isLeadCaptureHoldActive,
  HOLD_CONTACT_INFO
};
