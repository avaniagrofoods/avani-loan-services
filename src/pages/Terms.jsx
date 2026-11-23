import useSEO from '../hooks/useSEO';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './Privacy.css';

export default function Terms() {
  useSEO({
    title: 'Terms and Conditions | Avani Loan Services',
    description:
      'Terms and conditions governing the loan consultancy and advisory services of AVANI LOAN SERVICES in Latur, Maharashtra, India.',
    keywords: 'Terms and Conditions, Legal, Avani Loan Services, loan consultancy Maharashtra'
  });

  return (
    <div className="terms-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Legal Terms</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Terms and Conditions</h1>
          <p>Effective Date: November 22, 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-body glass-card">
            <h2>1. Nature of Business &amp; Consultancy Disclosure</h2>
            <p>
              <strong>{OFFICIAL_BUSINESS.name}</strong> operates in the category of <strong>{OFFICIAL_BUSINESS.category}</strong> with the business model of <strong>{OFFICIAL_BUSINESS.model}</strong>, headquartered in Latur, Maharashtra.
            </p>
            <div
              className="notice-box"
              style={{ background: 'var(--primary-soft)', padding: '16px', borderLeft: '4px solid var(--primary)', borderRadius: '6px', margin: '16px 0' }}
            >
              <strong>Important Disclosure:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
            </div>

            <h2>2. Permitted Use of Website &amp; Calculators</h2>
            <p>
              By accessing {OFFICIAL_BUSINESS.websiteUrl}, you agree to provide accurate contact information when submitting a consented loan advisory enquiry. Online EMI, FOIR, and financial tools are provided strictly for illustrative planning and do not constitute a binding offer of credit.
            </p>

            <h2>3. No Advance Cash Fee Policy</h2>
            <p>{OFFICIAL_BUSINESS.noAdvanceFeeNotice}</p>

            <h2>4. No Guarantee of Sanction, Rate, or Timeline</h2>
            <p>
              {OFFICIAL_BUSINESS.name} does not promise or guarantee loan approval, minimum interest rates, specific disbursement timelines, or credit score changes. All credit decisions rest solely with participating banks and NBFCs following independent verification and underwriting.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              All website content, branding, and custom tools displayed on {OFFICIAL_BUSINESS.websiteUrl} belong to {OFFICIAL_BUSINESS.name} unless attributed to third parties. Unauthorized reproduction or scraping is prohibited.
            </p>

            <h2>6. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms and Conditions are governed by the laws of India, with exclusive jurisdiction of competent courts in Latur, Maharashtra, India.
            </p>

            <h2>7. Official Contact</h2>
            <ul>
              <li><strong>Business Name:</strong> {OFFICIAL_BUSINESS.name}</li>
              <li><strong>Owner &amp; Founder:</strong> {OFFICIAL_BUSINESS.owner}</li>
              <li><strong>Address:</strong> {OFFICIAL_BUSINESS.fullAddress}</li>
              <li><strong>Telephone / WhatsApp:</strong> <a href={OFFICIAL_BUSINESS.telHref}>{OFFICIAL_BUSINESS.phoneDisplay}</a></li>
              <li><strong>Email:</strong> <a href={OFFICIAL_BUSINESS.emailHref}>{OFFICIAL_BUSINESS.email}</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
