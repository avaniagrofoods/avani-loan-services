import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Phone, MessageCircle, ExternalLink, Info, ArrowRight } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './CibilCheck.css';

const OFFICIAL_BUREAUS = [
  {
    name: 'TransUnion CIBIL',
    url: 'https://www.cibil.com/',
    note: 'RBI-licensed Credit Information Company (official consumer report portal)'
  },
  {
    name: 'Experian India',
    url: 'https://www.experian.in/',
    note: 'RBI-licensed Credit Information Company'
  },
  {
    name: 'Equifax India',
    url: 'https://www.equifax.co.in/',
    note: 'RBI-licensed Credit Information Company'
  },
  {
    name: 'CRIF High Mark',
    url: 'https://www.crifhighmark.com/',
    note: 'RBI-licensed Credit Information Company'
  }
];

const READINESS_FACTORS = [
  {
    title: '1. Review Your Official Bureau Report Directly',
    desc: 'Under RBI guidelines, Indian residents can request their official credit report directly from authorized credit bureaus. Always verify that personal details and account statuses are accurately reported.'
  },
  {
    title: '2. Timely EMI & Credit Card Payments',
    desc: 'Consistent, on-time payment of active loan EMIs and full credit card statement dues is a key indicator lenders consider during credit underwriting.'
  },
  {
    title: '3. Balanced Credit Utilization',
    desc: 'Keeping revolving credit card utilization moderate relative to sanctioned limits reflects disciplined borrowing habits.'
  },
  {
    title: '4. Focused Loan Applications',
    desc: 'Avoid submitting multiple simultaneous loan applications across lenders, as repeated hard credit enquiries within a short period can affect underwriting assessment.'
  },
  {
    title: '5. Disputing Factual Errors Through Official Channels',
    desc: 'If an official bureau report reflects an incorrect closed account or clerical discrepancy, raise a dispute directly with the respective credit bureau and lender using their formal grievance portal.'
  }
];

export default function CibilCheck() {
  useSEO({
    title: 'Credit Score Readiness & Advisory Guide | Avani Loan Services',
    description:
      'Educational guide on checking your credit report safely through RBI-licensed credit bureaus and preparing your credit profile before applying for a loan.',
    keywords: 'credit score readiness, RBI credit bureaus India, loan preparation guide, Avani Loan Services Latur'
  });

  return (
    <div className="cibil-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Educational Credit Readiness Guide</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Credit Score Readiness &amp; Loan Advisory Guide</h1>
          <p>
            Understand how RBI-licensed credit bureaus work and prepare your loan documentation responsibly — without sharing PAN details on this website.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Privacy & Non-Bureau Notice */}
          <div
            className="glass-card"
            role="region"
            aria-label="Important Privacy and Regulatory Notice"
            style={{
              background: 'var(--primary-soft)',
              border: '1px solid var(--border)',
              borderLeft: '5px solid var(--primary)',
              marginBottom: '28px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={24} color="#0369a1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h2 style={{ fontSize: '1.15rem', marginBottom: '8px', color: 'var(--primary-deep)' }}>
                  Privacy-First Policy: We Do Not Collect PAN or Generate Bureau Reports Here
                </h2>
                <p style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>
                  <strong>{OFFICIAL_BUSINESS.name}</strong> is an independent loan consultancy ({OFFICIAL_BUSINESS.category}) — not a credit bureau, bank, or lender. We do <strong>not</strong> generate credit bureau PDFs, imitate TransUnion CIBIL or any bureau, collect your PAN on this page, or guarantee credit score increases.
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.92rem', margin: 0 }}>
                  {OFFICIAL_BUSINESS.advisoryDisclosure}
                </p>
              </div>
            </div>
          </div>

          {/* Official RBI-Licensed Credit Bureaus */}
          <div className="glass-card" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--primary-deep)' }}>
              Check Your Official Credit Report Directly With RBI-Licensed Bureaus
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
              For an authentic credit report, always use the official websites of India’s four RBI-licensed Credit Information Companies:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
              {OFFICIAL_BUREAUS.map((b) => (
                <a
                  key={b.name}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: 'var(--primary-deep)' }}>{b.name}</strong>
                    <ExternalLink size={15} color="#0369a1" aria-hidden="true" />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>{b.note}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Credit Readiness Checklist */}
          <div className="glass-card" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '16px', color: 'var(--primary-deep)' }}>
              Practical Credit Readiness Checklist Before Applying
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {READINESS_FACTORS.map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <CheckCircle2 size={20} color="#0369a1" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: 'var(--text-dark)' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-light)', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory Consultation CTA */}
          <div
            className="glass-card"
            style={{
              background: 'var(--secondary-soft)',
              border: '1px solid #fcd34d',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#92400e', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={18} aria-hidden="true" /> Need Help Planning Your Loan Application?
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-dark)' }}>
              Speak With {OFFICIAL_BUSINESS.name} for Transparent Loan Advisory
            </h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '680px', margin: '0 auto 20px' }}>
              Our Latur-based loan consultancy team helps you understand standard lender criteria and documentation checklists before you apply with partner banks or NBFCs.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/contact" className="btn btn-primary">
                Request Advisory Callback <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={generateWhatsAppDocumentLink('Credit Readiness Advisory')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: '#15803d', color: '#ffffff' }}
              >
                <MessageCircle size={17} aria-hidden="true" /> WhatsApp Consultation
              </a>
              <a
                href={TEL_HREF}
                className="btn btn-outline"
                aria-label={`Call ${OFFICIAL_BUSINESS.name} at ${DISPLAY_PHONE}`}
              >
                <Phone size={17} aria-hidden="true" /> Call {DISPLAY_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
