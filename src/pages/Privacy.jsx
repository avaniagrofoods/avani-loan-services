import useSEO from '../hooks/useSEO';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './Privacy.css';

export default function Privacy() {
  useSEO({
    title: 'Privacy Policy | Avani Loan Services',
    description:
      'Privacy Policy and data-minimization standards for AVANI LOAN SERVICES in Latur, Maharashtra, India.',
    keywords: 'Privacy Policy, DPDP consent, data minimization, Avani Loan Services Latur'
  });

  return (
    <div className="privacy-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Legal &amp; Privacy</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Privacy Policy</h1>
          <p>Last updated: November 22, 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-body glass-card">
            <p>
              <strong>{OFFICIAL_BUSINESS.name}</strong> (“we”, “us”, or “our”), founded by {OFFICIAL_BUSINESS.owner} and operating in the category of {OFFICIAL_BUSINESS.category} ({OFFICIAL_BUSINESS.model}), respects your privacy and processes personal information strictly on a data-minimization and explicit-consent basis.
            </p>

            <h2>1. Information We Collect</h2>
            <p>When you voluntarily submit a consented loan advisory enquiry on {OFFICIAL_BUSINESS.websiteUrl}, we collect only minimal contact and requirement metadata:</p>
            <ul>
              <li>Full Name</li>
              <li>Mobile / WhatsApp Number</li>
              <li>Email Address (optional)</li>
              <li>City and General Loan Category / Approximate Requirement</li>
              <li>Your Explicit Consent Timestamp and Preferred Contact Channel</li>
            </ul>
            <p>
              <strong>Sensitive Financial Documents Policy:</strong> We do <strong>not</strong> collect PAN numbers on our public Credit Readiness Guide and do <strong>not</strong> accept public unauthenticated uploads of ITRs, Aadhaar copies, or bank statements through open web forms.
            </p>

            <h2>2. Purpose of Processing</h2>
            <p>Your enquiry details are used strictly to:</p>
            <ul>
              <li>Respond to your requested loan advisory consultation via your chosen contact method</li>
              <li>Share indicative documentation checklists and general lender criteria</li>
              <li>Coordinate formal loan applications with partner banks or NBFCs solely upon your explicit request</li>
            </ul>

            <h2>3. Data Sharing &amp; Storage</h2>
            <p>We do <strong>not</strong> sell, rent, or trade personal data to data brokers or unauthorized third parties. Information may be shared only with:</p>
            <ul>
              <li>Partner banks and RBI-regulated NBFCs when you explicitly choose to proceed with a formal loan application</li>
              <li>Authorized internal operational records managed exclusively by {OFFICIAL_BUSINESS.name} for enquiry follow-up and statutory compliance</li>
            </ul>

            <h2>4. Data Security &amp; Retention</h2>
            <p>
              We apply technical and organizational safeguards including HTTPS transport encryption, explicit consent tracking, and restricted internal access. Personal enquiry records are retained only for as long as necessary to fulfill your consultation request or satisfy applicable Indian legal obligations.
            </p>

            <h2>5. Your Privacy Rights &amp; Opt-Out</h2>
            <p>You may contact us at any time to:</p>
            <ul>
              <li>Request access to or correction of your submitted enquiry details</li>
              <li>Withdraw consent and opt out of phone, WhatsApp, or email follow-ups</li>
              <li>Request deletion of your enquiry record where not required by law</li>
            </ul>

            <h2>6. Privacy Contact</h2>
            <ul>
              <li><strong>Business Name:</strong> {OFFICIAL_BUSINESS.name}</li>
              <li><strong>Owner &amp; Founder:</strong> {OFFICIAL_BUSINESS.owner}</li>
              <li><strong>Email:</strong> <a href={OFFICIAL_BUSINESS.emailHref}>{OFFICIAL_BUSINESS.email}</a></li>
              <li><strong>Phone / WhatsApp:</strong> <a href={OFFICIAL_BUSINESS.telHref}>{OFFICIAL_BUSINESS.phoneDisplay}</a></li>
              <li><strong>Address:</strong> {OFFICIAL_BUSINESS.fullAddress}</li>
            </ul>

            <p className="privacy-footer">
              &copy; {new Date().getFullYear()} {OFFICIAL_BUSINESS.name}. All rights reserved. {OFFICIAL_BUSINESS.category}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
