import { Link } from 'react-router-dom';
import { CheckCircle, Award, ShieldCheck, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import LeadForm from '../components/LeadForm';
import { OFFICIAL_BUSINESS, OFFICIAL_SERVICES_NAV } from '../config/officialBusiness';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './About.css';

export default function About() {
  useSEO({
    title: 'About Avani Loan Services — Loan Consultancy in Latur, Maharashtra',
    description:
      'Learn about AVANI LOAN SERVICES, founded by Sachin Shinde in Latur, Maharashtra — an independent loan consultancy and advisory firm assisting retail, business, medical, education, and institutional clients.',
    keywords: 'About Avani Loan Services, Sachin Shinde Latur, loan consultancy Maharashtra, loan advisory Latur'
  });

  return (
    <div className="about-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">About Us</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>About {OFFICIAL_BUSINESS.name}</h1>
          <p>{OFFICIAL_BUSINESS.category} — Independent Loan Advisory &amp; Coordination in Latur &amp; Maharashtra</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-block">
              <div className="about-logo-wrapper glass-card">
                <img src={brandLogo} alt="Avani Loan Services Brand Mark" className="about-logo" width="160" height="160" />
                <p className="img-location" style={{ marginTop: '14px', fontSize: '0.9rem' }}>
                  📍 {OFFICIAL_BUSINESS.fullAddress}
                </p>
                <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'var(--primary-deep)', fontWeight: 600 }}>
                  {OFFICIAL_BUSINESS.ownerTitle}: {OFFICIAL_BUSINESS.owner}
                </p>
              </div>
              <div className="certifications">
                <div className="cert-badge"><ShieldCheck size={18} aria-hidden="true" /> Independent Loan Consultancy</div>
                <div className="cert-badge"><Award size={18} aria-hidden="true" /> Advisory &amp; Coordination</div>
              </div>
            </div>

            <div className="about-text">
              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Who We Are</span>
              <h2 style={{ marginTop: '10px', color: 'var(--primary-deep)' }}>
                Clear Guidance, Honest Documentation &amp; Transparent Coordination
              </h2>
              <p style={{ marginTop: '12px' }}>
                <strong>{OFFICIAL_BUSINESS.name}</strong>, founded and led by <strong>{OFFICIAL_BUSINESS.owner}</strong> in Latur, Maharashtra, operates as an independent <strong>{OFFICIAL_BUSINESS.category}</strong> practice specializing in <strong>{OFFICIAL_BUSINESS.model}</strong>.
              </p>
              <p style={{ marginTop: '14px' }}>
                We assist salaried individuals, business owners, medical professionals, students, homebuyers, property owners, and educational trusts in understanding standard lender eligibility criteria, organizing complete documentation files, and coordinating applications with suitable partner banks and NBFCs.
              </p>

              <div
                style={{
                  marginTop: '18px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'var(--secondary-soft)',
                  border: '1px solid #fcd34d',
                  color: '#78350f',
                  fontSize: '0.92rem'
                }}
              >
                <strong>Consultancy vs. Lender Distinction:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
              </div>

              <ul className="about-points" style={{ marginTop: '18px' }}>
                {[
                  'Dedicated advisory across all 8 official loan categories',
                  'Clear documentation checklists prepared before submission',
                  'Multilingual local support in English, Marathi, and Hindi',
                  'Strict no-advance-cash-fee ethical advisory policy',
                  'Indicative EMI & FOIR calculators to aid responsible financial planning'
                ].map((pt) => (
                  <li key={pt}><CheckCircle size={18} color="var(--primary)" aria-hidden="true" /> {pt}</li>
                ))}
              </ul>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
                <Link to="/contact" className="btn btn-primary">
                  Book Advisory Consultation <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a href={generateWhatsAppDocumentLink('Personal Loan')} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#15803d', color: '#ffffff' }}>
                  <MessageCircle size={17} aria-hidden="true" /> WhatsApp Us
                </a>
                <a href={TEL_HREF} className="btn btn-outline">
                  <Phone size={16} aria-hidden="true" /> {DISPLAY_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--primary-soft)' }}>
        <div className="container text-center">
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Our 8 Service Areas</span>
          <h2 className="section-title" style={{ marginTop: '10px' }}>Loan Advisory Categories We Support</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            {OFFICIAL_SERVICES_NAV.map((svc) => (
              <Link
                key={svc.slug}
                to={`/services/${svc.slug}`}
                className="btn btn-outline"
                style={{ background: '#ffffff' }}
              >
                {svc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mission-section section">
        <div className="container text-center">
          <span className="badge" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }}>Connect With Us</span>
          <h2 className="section-title" style={{ marginTop: '10px' }}>Have a Loan Question? Request a Consultation</h2>
          <p style={{ fontSize: '1.02rem', maxWidth: '680px', margin: '10px auto 28px', color: 'var(--text-light)' }}>
            Share your requirement below and our team will respond during business hours with clear documentation guidance.
          </p>
          <LeadForm compact={true} />
        </div>
      </section>
    </div>
  );
}
