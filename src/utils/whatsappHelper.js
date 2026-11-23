// src/utils/whatsappHelper.js
// Centralized Reusable Contact & WhatsApp Helper for AVANI LOAN SERVICES
// Official Phone & WhatsApp confirmed under DEC-003B-06: +91 91756 35165

import { OFFICIAL_BUSINESS } from '../config/officialBusiness';

export const WHATSAPP_NUMBER = OFFICIAL_BUSINESS.whatsappNumber;
export const PHONE_NUMBER = OFFICIAL_BUSINESS.phoneE164;
export const TEL_HREF = OFFICIAL_BUSINESS.telHref;
export const DISPLAY_PHONE = OFFICIAL_BUSINESS.phoneDisplay;

const PRODUCT_MESSAGES = {
  'Personal Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Personal Loan.',
  'Salary Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Personal Loan.',
  'Business Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Business Loan.',
  'Doctor Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Doctor Loan.',
  'Doctor / Professional Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Doctor Loan.',
  'Home Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Home Loan.',
  'Mortgage Loan': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Mortgage Loan (Loan Against Property).',
  'Mortgage Loan / LAP': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Mortgage Loan (Loan Against Property).',
  'Loan Against Property': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for a Mortgage Loan (Loan Against Property).',
  'Education Loan India': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for an Education Loan — India.',
  'Education Loan — India': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for an Education Loan — India.',
  'Education Loan Global': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for an Education Loan — Global Studies.',
  'Education Loan — Global Studies': 'Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for an Education Loan — Global Studies.',
  'School and College Funding': 'Hello AVANI LOAN SERVICES, I would like institutional loan advisory and the indicative document checklist for School and College Funding.',
  'School Funding': 'Hello AVANI LOAN SERVICES, I would like institutional loan advisory for School and College Funding.',
  'College Funding': 'Hello AVANI LOAN SERVICES, I would like institutional loan advisory for School and College Funding.',
  'Credit Readiness Advisory': 'Hello AVANI LOAN SERVICES, I would like educational loan readiness and credit-profile consultation.'
};

export function generateWhatsAppDocumentLink(productName = 'Personal Loan') {
  const messageText =
    PRODUCT_MESSAGES[productName] ||
    `Hello AVANI LOAN SERVICES, I would like loan advisory and the indicative document checklist for ${productName}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
}

export function trackCtaClick(eventName, product = '') {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, { product });
  }
}
