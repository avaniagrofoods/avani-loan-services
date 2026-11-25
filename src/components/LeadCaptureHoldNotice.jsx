// src/components/LeadCaptureHoldNotice.jsx
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — REUSABLE LEAD CAPTURE HOLD NOTIFICATION (APR-033)
// Displayed when online lead submission is temporarily held for CRM verification.
// Preserves entered applicant details, prevents false success messages,
// and presents direct contact alternatives (WhatsApp, Phone, Email).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { AlertTriangle, MessageCircle, PhoneCall, Mail, Globe, ArrowLeft, ShieldCheck } from 'lucide-react';
import { HOLD_CONTACT_INFO } from '../config/leadCaptureHold.js';
import './LeadCaptureHoldNotice.css';

export default function LeadCaptureHoldNotice({
  form = {},
  loanType = '',
  onBack,
  customMessage
}) {
  const applicantName = form.name || form.fullName || form.contact_person || '';
  const selectedProduct = loanType || form.loanType || form.partnership_interest || form.funding_requirement || '';

  return (
    <div className="lead-hold-card" role="alert" aria-live="polite">
      <div className="lead-hold-badge">
        <AlertTriangle size={15} aria-hidden="true" />
        <span>{HOLD_CONTACT_INFO.badge}</span>
      </div>

      <h3 className="lead-hold-title">{HOLD_CONTACT_INFO.title}</h3>

      <p className="lead-hold-message">
        {customMessage || HOLD_CONTACT_INFO.message}
      </p>

      {(applicantName || selectedProduct) && (
        <div className="lead-hold-retained-box">
          <div>
            <strong>Status of Your Input:</strong> Your form inputs have not been sent to unverified automated databases and remain intact on this page.
          </div>
          {applicantName && (
            <div style={{ marginTop: '4px' }}>
              <strong>Applicant / Contact:</strong> {applicantName}
            </div>
          )}
          {selectedProduct && (
            <div>
              <strong>Service Interest:</strong> {selectedProduct}
            </div>
          )}
        </div>
      )}

      <div className="lead-hold-actions">
        {/* Direct WhatsApp Action - No PII in query parameters */}
        <a
          href={HOLD_CONTACT_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lead-hold-btn lead-hold-btn-whatsapp"
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span>Chat on WhatsApp ({HOLD_CONTACT_INFO.phone})</span>
        </a>

        {/* Direct Phone Call Action */}
        <a
          href={HOLD_CONTACT_INFO.telHref}
          className="lead-hold-btn lead-hold-btn-phone"
        >
          <PhoneCall size={18} aria-hidden="true" />
          <span>Call Desk: {HOLD_CONTACT_INFO.phone}</span>
        </a>

        {/* Option to return and view/edit retained details */}
        {onBack && (
          <button
            type="button"
            className="lead-hold-btn lead-hold-btn-outline"
            onClick={onBack}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Review / Edit Form Details</span>
          </button>
        )}
      </div>

      <div className="lead-hold-channels">
        <span>
          <strong>Email:</strong>{' '}
          <a href={HOLD_CONTACT_INFO.emailHref}>{HOLD_CONTACT_INFO.email}</a>
        </span>
        <span>
          <strong>Website:</strong>{' '}
          <a href={HOLD_CONTACT_INFO.websiteUrl} target="_blank" rel="noopener noreferrer">
            www.avanifinserv.com
          </a>
        </span>
      </div>

      <div className="lead-hold-footer">
        <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
        {HOLD_CONTACT_INFO.privacyNotice}
      </div>
    </div>
  );
}
