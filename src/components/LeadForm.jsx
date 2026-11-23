import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader, MessageCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { OFFICIAL_BUSINESS, OFFICIAL_SERVICES_NAV } from '../config/officialBusiness';
import { syncLeadData } from '../lib/syncLeads';
import { generateWhatsAppDocumentLink } from '../utils/whatsappHelper';
import './LeadForm.css';

const PHONE_REGEX = /^[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadForm({ compact = false, loanType = '' }) {
  const uid = useId();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    loanType: loanType || '',
    amount: '',
    city: 'Latur',
    consent: false
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

    if (!form.name.trim() || form.name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!PHONE_REGEX.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
      setErrorMsg('Please enter a valid email address or leave it blank.');
      return;
    }
    if (!form.loanType) {
      setErrorMsg('Please select the loan advisory service you require.');
      return;
    }
    if (!form.consent) {
      setErrorMsg('Please tick the explicit consent checkbox before submitting your enquiry.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    await syncLeadData({
      ...form,
      phone: cleanPhone,
      consent: true,
      source: compact ? 'Website_Compact_Enquiry' : 'Website_Enquiry'
    });

    setStatus('success');
  };

  if (status === 'success') {
    const waUrl = generateWhatsAppDocumentLink(form.loanType || 'Personal Loan');
    return (
      <div className="form-success" role="status" aria-live="polite">
        <CheckCircle size={44} color="#15803d" aria-hidden="true" />
        <h3>Enquiry Received</h3>
        <p>
          Thank you, <strong>{form.name}</strong>. Your advisory request for <strong>{form.loanType}</strong> has been recorded. Our advisor will reach out during business hours.
        </p>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-light)' }}>{OFFICIAL_BUSINESS.advisoryDisclosure}</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#15803d', color: '#ffffff' }}>
            <MessageCircle size={16} aria-hidden="true" /> Optional: Chat on WhatsApp
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setForm({ name: '', phone: '', email: '', loanType: loanType || '', amount: '', city: 'Latur', consent: false });
              setStatus('idle');
            }}
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={`lead-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit} noValidate>
      {!compact && <h3 className="form-title">Request Free Loan Advisory</h3>}

      {errorMsg && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.88rem'
          }}
        >
          <AlertCircle size={17} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={compact ? 'compact-grid' : ''}>
        <div className="form-group">
          <label htmlFor={`${uid}-name`} className="form-label">Full Name *</label>
          <input
            id={`${uid}-name`}
            className="form-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-phone`} className="form-label">10-Digit Mobile Number *</label>
          <input
            id={`${uid}-phone`}
            className="form-input"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-email`} className="form-label">Email (Optional)</label>
          <input
            id={`${uid}-email`}
            className="form-input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-loanType`} className="form-label">Loan Service *</label>
          <select
            id={`${uid}-loanType`}
            className="form-select"
            name="loanType"
            value={form.loanType}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Loan Service --</option>
            {OFFICIAL_SERVICES_NAV.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-amount`} className="form-label">Approximate Requirement (₹)</label>
          <input
            id={`${uid}-amount`}
            className="form-input"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 5,00,000"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${uid}-city`} className="form-label">City</label>
          <input
            id={`${uid}-city`}
            className="form-input"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="e.g. Latur, Pune"
          />
        </div>
      </div>

      <div
        style={{
          marginBottom: '14px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd'
        }}
      >
        <label
          htmlFor={`${uid}-consent`}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: '#0f172a', cursor: 'pointer' }}
        >
          <input
            id={`${uid}-consent`}
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0 }}
            required
          />
          <span>
            {OFFICIAL_BUSINESS.consentText}{' '}
            <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      <button type="submit" className="btn btn-secondary submit-btn" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <>
            <Loader size={18} className="spin" aria-hidden="true" /> Submitting...
          </>
        ) : (
          'Request Advisory Callback'
        )}
      </button>

      <p className="form-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-light)' }}>
        <ShieldCheck size={15} color="#0369a1" aria-hidden="true" /> Independent loan consultancy — final approval &amp; rates rest solely with partner lenders.
      </p>
    </form>
  );
}
