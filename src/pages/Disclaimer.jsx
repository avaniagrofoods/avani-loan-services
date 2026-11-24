import useSEO from '../hooks/useSEO';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './Privacy.css';

export default function Disclaimer() {
  useSEO({
    title: 'Financial & Advisory Disclaimer | Avani Loan Services',
    description:
      'Regulatory and advisory disclaimer for AVANI LOAN SERVICES — Independent Loan Consultancy & Coordination in Latur, Maharashtra.',
    keywords: 'Disclaimer, Loan Consultancy Disclosure, Avani Loan Services Latur'
  });

  return (
    <div className="disclaimer-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Advisory Notice</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Financial &amp; Advisory Disclaimer</h1>
          <p>Important Disclosures Regarding Loan Consultancy &amp; Partner Lenders</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-body glass-card">
            <h2>1. Independent Loan Consultancy — Not a Bank or Lender</h2>
            <p>{OFFICIAL_BUSINESS.advisoryDisclosure}</p>

            <h2>2. No Underwriting or Direct Lending Authority</h2>
            <p>
              <strong>{OFFICIAL_BUSINESS.name}</strong> does not underwrite loans, issue sanction letters, accept deposits, or disburse funds directly. Our role is strictly limited to loan advisory, documentation guidance, and application coordination with partner banks and RBI-regulated NBFCs.
            </p>

            <h2>3. Indicative Estimates Only</h2>
            <p>
              All calculators, eligibility figures, and educational articles on {OFFICIAL_BUSINESS.websiteUrl} are illustrative and informational only. Applicable interest rates, loan-to-value (LTV) limits, processing fees, and repayment schedules are finalized exclusively by the lending institution after independent credit, income, and legal/technical verification.
            </p>

            <h2>4. Credit Bureau Independence</h2>
            <p>
              {OFFICIAL_BUSINESS.name} is not affiliated with TransUnion CIBIL, Experian, Equifax, or CRIF High Mark and does not generate official credit bureau reports or guarantee credit score changes.
            </p>

            <h2>5. Public Caution Against Advance Fee Fraud</h2>
            <div
              className="notice-box"
              style={{ background: 'var(--secondary-soft)', padding: '16px', borderLeft: '4px solid var(--secondary)', borderRadius: '6px', margin: '16px 0' }}
            >
              <strong>Public Caution:</strong> {OFFICIAL_BUSINESS.noAdvanceFeeNotice} If anyone claiming to represent {OFFICIAL_BUSINESS.name} requests an advance transfer to a personal account or UPI ID, do not pay and immediately report it to <a href={OFFICIAL_BUSINESS.emailHref}>{OFFICIAL_BUSINESS.email}</a> or <a href={OFFICIAL_BUSINESS.telHref}>{OFFICIAL_BUSINESS.phoneDisplay}</a>.
            </div>

            <h2>6. Official Contact &amp; Grievance Desk</h2>
            <ul>
              <li><strong>Business Name:</strong> {OFFICIAL_BUSINESS.name}</li>
              <li><strong>Owner &amp; Founder:</strong> {OFFICIAL_BUSINESS.owner}</li>
              <li><strong>Address:</strong> {OFFICIAL_BUSINESS.fullAddress}</li>
              <li><strong>Phone / WhatsApp:</strong> <a href={OFFICIAL_BUSINESS.telHref}>{OFFICIAL_BUSINESS.phoneDisplay}</a></li>
              <li><strong>Email:</strong> <a href={OFFICIAL_BUSINESS.emailHref}>{OFFICIAL_BUSINESS.email}</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
