import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, AlertCircle, ShieldCheck, MessageCircle } from 'lucide-react';
import { OFFICIAL_BUSINESS, OFFICIAL_SERVICES_NAV } from '../config/officialBusiness';
import { syncLeadData } from '../lib/syncLeads';
import { generateWhatsAppDocumentLink } from '../utils/whatsappHelper';

const PHONE_REGEX = /^[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitialLoanType() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    if (product) return product;
  }
  return 'Personal Loan';
}

export default function SimpleLeadForm() {
  const uid = useId();
  const [formData, setFormData] = useState(() => ({
    name: '',
    phone: '',
    email: '',
    city: 'Latur',
    customerProfile: 'Salaried Professional',
    loanType: getInitialLoanType(),
    amount: '₹5–10 Lakh',
    employmentType: 'Salaried',
    monthlyIncome: '₹25,000–₹50,000',
    contactPreference: 'WhatsApp + Call',
    preferredCallTime: 'During Business Hours',
    consent: false
  }));

  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!PHONE_REGEX.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address or leave it blank.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }
    if (!formData.consent) {
      setErrorMsg('Please check the explicit consent box before submitting your enquiry.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    await syncLeadData({
      ...formData,
      phone: cleanPhone,
      consent: true,
      source: 'Website_Contact_Page'
    });

    setStatus('success');
  };

  if (status === 'success') {
    const waHref = generateWhatsAppDocumentLink(formData.loanType);
    return (
      <div
        className="form-success-card"
        role="status"
        aria-live="polite"
        style={{ textAlign: 'center', padding: '32px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}
      >
        <CheckCircle2 size={56} color="#15803d" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
        <h3 style={{ color: '#14532d', marginBottom: '10px' }}>Consultation Enquiry Recorded</h3>
        <p style={{ color: '#166534', marginBottom: '16px' }}>
          Thank you, <strong>{formData.name}</strong>. Your enquiry for <strong>{formData.loanType}</strong> has been received. Our advisor will reach out via <strong>{formData.contactPreference}</strong> during office hours.
        </p>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-light)', marginBottom: '18px' }}>
          {OFFICIAL_BUSINESS.advisoryDisclosure}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ background: '#15803d', color: '#ffffff', width: '100%', justifyContent: 'center' }}
          >
            <MessageCircle size={17} aria-hidden="true" /> Continue on WhatsApp (Optional)
          </a>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, name: '', phone: '', email: '', consent: false }));
              setStatus('idle');
            }}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="simple-contact-form glass-card" style={{ padding: '28px', background: '#ffffff', borderRadius: '12px' }} noValidate>
      {errorMsg && (
        <div
          role="alert"
          style={{
            marginBottom: '18px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={19} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor={`${uid}-name`} className="form-label">Full Name *</label>
        <input id={`${uid}-name`} type="text" name="name" required value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" autoComplete="name" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor={`${uid}-phone`} className="form-label">10-Digit Mobile Number *</label>
          <input id={`${uid}-phone`} type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="form-input" placeholder="10-digit mobile number" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="form-label">Email Address (Optional)</label>
          <input id={`${uid}-email`} type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="name@example.com" autoComplete="email" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor={`${uid}-city`} className="form-label">City *</label>
          <input id={`${uid}-city`} type="text" name="city" required value={formData.city} onChange={handleChange} className="form-input" placeholder="e.g. Latur, Pune" />
        </div>
        <div>
          <label htmlFor={`${uid}-profile`} className="form-label">Applicant Profile *</label>
          <select id={`${uid}-profile`} name="customerProfile" value={formData.customerProfile} onChange={handleChange} className="form-select">
            <option>Salaried Professional</option>
            <option>Business Owner / MSME</option>
            <option>Self-Employed</option>
            <option>Doctor / Medical Practitioner</option>
            <option>Chartered Accountant / Professional</option>
            <option>Student / Parent</option>
            <option>Home / Property Buyer</option>
            <option>School / College Trust Management</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor={`${uid}-loanType`} className="form-label">Loan Service Required *</label>
          <select id={`${uid}-loanType`} name="loanType" value={formData.loanType} onChange={handleChange} className="form-select">
            {OFFICIAL_SERVICES_NAV.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
            <option>Not Sure — Need Advisory Guidance</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-amount`} className="form-label">Approximate Requirement *</label>
          <select id={`${uid}-amount`} name="amount" value={formData.amount} onChange={handleChange} className="form-select">
            <option>Below ₹5 Lakh</option>
            <option>₹5–10 Lakh</option>
            <option>₹10–25 Lakh</option>
            <option>₹25–50 Lakh</option>
            <option>₹50 Lakh–₹1 Crore</option>
            <option>Above ₹1 Crore</option>
            <option>To Be Discussed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor={`${uid}-pref`} className="form-label">Preferred Contact Method *</label>
          <select id={`${uid}-pref`} name="contactPreference" value={formData.contactPreference} onChange={handleChange} className="form-select">
            <option>WhatsApp + Call</option>
            <option>WhatsApp Only</option>
            <option>Phone Call</option>
            <option>Email</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-time`} className="form-label">Preferred Time *</label>
          <select id={`${uid}-time`} name="preferredCallTime" value={formData.preferredCallTime} onChange={handleChange} className="form-select">
            <option>During Business Hours</option>
            <option>Morning (10 AM – 1 PM)</option>
            <option>Afternoon (2 PM – 5 PM)</option>
            <option>Evening (5 PM – 7 PM)</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '18px', background: '#f0f9ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
        <label htmlFor={`${uid}-consent`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.86rem', color: '#0f172a', cursor: 'pointer' }}>
          <input
            id={`${uid}-consent`}
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0 }}
            required
          />
          <span>
            {OFFICIAL_BUSINESS.consentText}{' '}
            <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Read Privacy Policy</Link>.
          </span>
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
        {status === 'loading' ? 'Submitting Enquiry...' : 'Submit Loan Advisory Enquiry'} <Send size={17} style={{ marginLeft: '6px' }} aria-hidden="true" />
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={16} color="#0369a1" aria-hidden="true" /> {OFFICIAL_BUSINESS.advisoryDisclosure}
      </p>
    </form>
  );
}
