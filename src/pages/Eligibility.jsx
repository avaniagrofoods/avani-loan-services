import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck, CheckCircle2, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { OFFICIAL_BUSINESS, OFFICIAL_SERVICES_NAV } from '../config/officialBusiness';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './Eligibility.css';

const INDICATIVE_RATE_BY_TYPE = {
  'Personal Loan': 11.5,
  'Business Loan': 13.0,
  'Doctor Loan': 10.75,
  'Home Loan': 8.75,
  'Mortgage Loan': 9.75,
  'Education Loan — India': 9.5,
  'Education Loan — Global Studies': 10.5,
  'School and College Funding': 11.0
};

export default function Eligibility() {
  useSEO({
    title: 'Indicative Loan Eligibility & FOIR Estimator | Avani Loan Services',
    description:
      'Privacy-first client-side loan eligibility and FOIR calculator. Estimate indicative borrowing capacity offline with zero document uploads.',
    keywords: 'loan eligibility estimator, FOIR calculator, EMI planning, Avani Loan Services Latur'
  });

  const [formData, setFormData] = useState({
    loanType: 'Personal Loan',
    monthlyNetIncome: '60000',
    existingEmi: '5000',
    tenureYears: '5',
    indicativeRate: '11.5',
    foirLimitPct: '50'
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLoanTypeChange = (loanType) => {
    const suggestedRate = INDICATIVE_RATE_BY_TYPE[loanType] || 11.0;
    setFormData((prev) => ({ ...prev, loanType, indicativeRate: String(suggestedRate) }));
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');
    const income = Number(formData.monthlyNetIncome);
    const existingEmi = Number(formData.existingEmi || 0);
    const tenureMonths = Number(formData.tenureYears) * 12;
    const annualRate = Number(formData.indicativeRate);
    const foirCap = Number(formData.foirLimitPct) / 100;

    if (!Number.isFinite(income) || income <= 0) {
      setError('Please enter a valid positive Monthly Net Income.');
      setResult(null);
      return;
    }
    if (!Number.isFinite(existingEmi) || existingEmi < 0) {
      setError('Existing monthly EMI cannot be negative.');
      setResult(null);
      return;
    }
    if (!Number.isFinite(tenureMonths) || tenureMonths < 6 || tenureMonths > 360) {
      setError('Please choose a tenure between 1 and 30 years.');
      setResult(null);
      return;
    }
    if (!Number.isFinite(annualRate) || annualRate <= 0 || annualRate > 36) {
      setError('Please enter an indicative annual interest rate between 1% and 36%.');
      setResult(null);
      return;
    }

    const maxTotalObligation = income * foirCap;
    const availableEmi = Math.max(0, maxTotalObligation - existingEmi);
    const r = annualRate / 12 / 100;
    const factor = Math.pow(1 + r, tenureMonths);
    const maxPrincipal = availableEmi > 0 ? Math.round((availableEmi * (factor - 1)) / (r * factor)) : 0;
    const currentFoirPct = Number(((existingEmi / income) * 100).toFixed(1));
    const projectedFoirPct = Number((((existingEmi + availableEmi) / income) * 100).toFixed(1));

    setResult({
      maxPrincipal,
      availableEmi: Math.round(availableEmi),
      currentFoirPct,
      projectedFoirPct,
      tenureMonths,
      annualRate
    });
  };

  return (
    <div className="eligibility-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Self-Service FOIR Estimator</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Indicative Loan Eligibility Estimator</h1>
          <p>
            Calculate an indicative borrowing estimate right in your browser — zero ITR or bank-statement uploads required.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Privacy Safeguard Notice */}
          <div
            className="glass-card"
            style={{
              background: 'var(--primary-soft)',
              border: '1px solid var(--border)',
              borderLeft: '5px solid var(--primary)',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={22} color="#0369a1" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-dark)' }}>
                <strong>Privacy Safeguard:</strong> This estimator runs locally in your browser. For your protection, public file uploads for ITRs, PAN, or bank statements are disabled on this page. Never upload sensitive financial documents to unauthenticated public web forms.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <form onSubmit={handleCalculate} noValidate>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '18px', color: 'var(--primary-deep)' }}>
                Enter Indicative Income &amp; Loan Parameters
              </h2>

              {error && (
                <div
                  role="alert"
                  style={{
                    padding: '12px 14px',
                    marginBottom: '16px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c'
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="elig-loan-type" className="form-label">Loan Service Category</label>
                  <select
                    id="elig-loan-type"
                    className="form-select"
                    value={formData.loanType}
                    onChange={(e) => handleLoanTypeChange(e.target.value)}
                  >
                    {OFFICIAL_SERVICES_NAV.map((s) => (
                      <option key={s.slug} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="elig-income" className="form-label">Monthly Net Income (₹)</label>
                  <input
                    id="elig-income"
                    type="number"
                    min="1000"
                    className="form-input"
                    value={formData.monthlyNetIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyNetIncome: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="elig-emi" className="form-label">Existing Monthly EMIs (₹)</label>
                  <input
                    id="elig-emi"
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.existingEmi}
                    onChange={(e) => setFormData({ ...formData, existingEmi: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="elig-tenure" className="form-label">Illustrative Tenure (Years)</label>
                  <input
                    id="elig-tenure"
                    type="number"
                    min="1"
                    max="30"
                    className="form-input"
                    value={formData.tenureYears}
                    onChange={(e) => setFormData({ ...formData, tenureYears: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="elig-rate" className="form-label">Illustrative Interest Rate (% p.a.)</label>
                  <input
                    id="elig-rate"
                    type="number"
                    step="0.05"
                    min="1"
                    max="36"
                    className="form-input"
                    value={formData.indicativeRate}
                    onChange={(e) => setFormData({ ...formData, indicativeRate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="elig-foir" className="form-label">Assumed FOIR Cap (%)</label>
                  <select
                    id="elig-foir"
                    className="form-select"
                    value={formData.foirLimitPct}
                    onChange={(e) => setFormData({ ...formData, foirLimitPct: e.target.value })}
                  >
                    <option value="40">40% (Conservative)</option>
                    <option value="50">50% (Standard Illustrative)</option>
                    <option value="60">60% (Higher Income Slab)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                <Calculator size={18} aria-hidden="true" /> Calculate Indicative Estimate
              </button>
            </form>
          </div>

          {result && (
            <div className="glass-card" aria-live="polite" style={{ borderTop: '4px solid var(--secondary)' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-deep)' }}>
                <CheckCircle2 size={22} color="#15803d" aria-hidden="true" /> Indicative Estimate — {formData.loanType}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--primary-soft)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Indicative Principal Capacity</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-deep)' }}>
                    ₹{result.maxPrincipal.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--secondary-soft)', border: '1px solid #fcd34d' }}>
                  <div style={{ fontSize: '0.82rem', color: '#92400e' }}>Indicative Monthly EMI Headroom</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e' }}>
                    ₹{result.availableEmi.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Current / Projected FOIR</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {result.currentFoirPct}% / {result.projectedFoirPct}%
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid var(--secondary)', marginBottom: '18px' }}>
                <strong>Illustrative Estimate Only:</strong> Actual loan eligibility, applicable interest rate, tenure, and sanction depend strictly on lender underwriting policy, credit bureau assessment, income verification, and collateral evaluation. {OFFICIAL_BUSINESS.advisoryDisclosure}
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary">
                  Speak With an Advisor <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href={generateWhatsAppDocumentLink(formData.loanType)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#15803d', color: '#ffffff' }}
                >
                  <MessageCircle size={17} aria-hidden="true" /> Get Document Checklist on WhatsApp
                </a>
                <a href={TEL_HREF} className="btn btn-outline">
                  <Phone size={17} aria-hidden="true" /> Call {DISPLAY_PHONE}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
