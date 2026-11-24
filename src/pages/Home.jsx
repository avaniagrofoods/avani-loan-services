import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Users, Award, ArrowRight, Phone, MessageCircle, FileCheck2, Calculator } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import LeadForm from '../components/LeadForm';
import services from '../data/services.json';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import personalImg from '../assets/optimized/personal-loan.webp';
import businessImg from '../assets/optimized/business-loan.webp';
import doctorImg from '../assets/optimized/doctor-loan.webp';
import homeImg from '../assets/optimized/home-loan.webp';
import mortgageImg from '../assets/optimized/mortgage-loan.webp';
import educationImg from '../assets/optimized/education-loan.webp';
import cibilBanner from '../assets/optimized/avani_cibil_banner.webp';

const IMAGE_MAP = {
  personal: personalImg,
  business: businessImg,
  doctor: doctorImg,
  home: homeImg,
  mortgage: mortgageImg,
  education: educationImg
};

const ADVISORY_PILLARS = [
  { icon: <Shield size={30} aria-hidden="true" />, title: 'Independent Loan Consultancy', desc: 'Objective guidance and application coordination — we clearly distinguish our advisory role from partner banks and NBFCs.' },
  { icon: <FileCheck2 size={30} aria-hidden="true" />, title: 'Structured Documentation', desc: 'Complete checklists for KYC, income, property title, and institutional audit files before submission.' },
  { icon: <Calculator size={30} aria-hidden="true" />, title: 'Indicative Financial Tools', desc: 'Self-service EMI, FOIR, prepayment, and comparison calculators to plan repayments responsibly.' },
  { icon: <Users size={30} aria-hidden="true" />, title: 'Dedicated Local Advisory', desc: 'Direct consultation in English, Marathi, and Hindi from our office in Latur serving Maharashtra.' },
  { icon: <CheckCircle size={30} aria-hidden="true" />, title: 'No Advance Cash Fees', desc: 'Zero upfront cash deposits into personal accounts; lender fees apply directly per bank schedules.' },
  { icon: <Award size={30} aria-hidden="true" />, title: 'All 8 Advisory Categories', desc: 'Retail, business, medical professional, domestic & global education, and school/college institutional finance.' }
];

export default function Home() {
  useSEO({
    title: 'Avani Loan Services — Loan Consultancy & Advisory in Latur, Maharashtra',
    description:
      'AVANI LOAN SERVICES (Founded by Sachin Shinde) offers independent loan consultancy and coordination in Latur & Maharashtra across Personal, Business, Doctor, Home, Mortgage, Education, and School & College Funding.',
    keywords:
      'Avani Loan Services, loan consultancy Latur, Personal Loan, Business Loan, Doctor Loan, Home Loan, Mortgage Loan, Education Loan India Global, School and College Funding Maharashtra'
  });

  const { t } = useLanguage();

  return (
    <div className="home-page">
      {/* Hero Section — Sky Blue + Light Golden */}
      <section
        className="hero-section"
        style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 55%, #0284c7 100%)', color: '#ffffff' }}
      >
        <div className="container hero-content">
          <div className="hero-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <img src={brandLogo} alt="Avani Loan Services Logo" width="52" height="52" style={{ borderRadius: '10px', background: '#ffffff', padding: '4px' }} />
              <span
                style={{
                  background: '#fffbeb',
                  color: '#92400e',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid #fcd34d'
                }}
              >
                {OFFICIAL_BUSINESS.category}
              </span>
            </div>

            <h1 className="hero-title" style={{ color: '#ffffff' }}>
              Transparent Loan Advisory &amp;{' '}
              <span style={{ color: '#fde68a' }}>Coordination</span> in Latur &amp; Maharashtra
            </h1>

            <p className="hero-subtitle" style={{ color: '#e0f2fe', marginTop: '14px' }}>
              {t('hero_subtitle')}
            </p>

            <p style={{ fontSize: '0.88rem', color: '#bae6fd', marginTop: '10px' }}>
              Office: {OFFICIAL_BUSINESS.shortAddress}
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
              <Link to="/services" className="btn btn-secondary hero-btn">
                Explore All 8 Loan Services <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={generateWhatsAppDocumentLink('Personal Loan')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: '#15803d', color: '#ffffff' }}
              >
                <MessageCircle size={17} aria-hidden="true" /> WhatsApp Advisory
              </a>
              <a
                href={TEL_HREF}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.14)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)' }}
                aria-label={`Call ${OFFICIAL_BUSINESS.name} at ${DISPLAY_PHONE}`}
              >
                <Phone size={16} aria-hidden="true" /> Call {DISPLAY_PHONE}
              </a>
            </div>
          </div>

          <div className="hero-form">
            <LeadForm compact={true} />
          </div>
        </div>
      </section>

      {/* Regulatory Advisory Clarity Banner */}
      <section style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '16px 0' }}>
        <div className="container" style={{ textAlign: 'center', color: '#78350f', fontSize: '0.92rem' }}>
          <strong>Important Disclosure:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
        </div>
      </section>

      {/* All 8 Official Loan Advisory Services */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '36px' }}>
            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Our 8 Official Services</span>
            <h2 className="section-title" style={{ marginTop: '10px' }}>Loan Consultancy &amp; Coordination Services</h2>
            <p className="section-subtitle" style={{ maxWidth: '720px', margin: '10px auto 0' }}>
              Structured advisory, document checklists, and lender coordination across retail, business, medical, education, and institutional categories.
            </p>
          </div>

          <div className="loans-grid">
            {services.map((svc) => (
              <article key={svc.slug} className="loan-card glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="loan-card-img-wrapper">
                    <img
                      src={IMAGE_MAP[svc.imageKey] || personalImg}
                      alt={`${svc.h1} advisory illustration`}
                      className="loan-card-img"
                      width="400"
                      height="240"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="loan-title" style={{ color: 'var(--primary-deep)' }}>{svc.h1}</h3>
                  <p className="loan-desc">{svc.summary}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                  <Link to={`/services/${svc.slug}`} className="btn btn-primary" style={{ flex: '1 1 auto' }}>
                    View Details <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <a
                    href={generateWhatsAppDocumentLink(svc.whatsappProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    aria-label={`Get ${svc.h1} document checklist on WhatsApp`}
                  >
                    Checklist
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Readiness & Financial Tools Highlight */}
      <section className="section" style={{ background: 'var(--primary-soft)' }}>
        <div className="container">
          <div className="cibil-section glass-card">
            <div className="cibil-grid">
              <div className="cibil-image-content">
                <img
                  src={cibilBanner}
                  alt="Credit score readiness educational guidance by Avani Loan Services"
                  className="cibil-img"
                  width="500"
                  height="320"
                  loading="lazy"
                />
              </div>
              <div className="cibil-text-content">
                <span className="badge" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }}>
                  Educational Guidance
                </span>
                <h2 style={{ fontSize: '1.6rem', margin: '10px 0', color: 'var(--primary-deep)' }}>
                  Credit Score Readiness &amp; EMI Planning Tools
                </h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
                  Learn how to check your official credit report safely through RBI-licensed bureaus and plan your monthly EMIs and FOIR before submitting any loan application with partner lenders.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/cibil-check" className="btn btn-primary">
                    Read Credit Readiness Guide <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link to="/financial-tools" className="btn btn-outline">
                    Open Financial Calculators
                  </Link>
                  <a href={TEL_HREF} className="btn btn-outline" aria-label={`Call ${OFFICIAL_BUSINESS.name}`}>
                    <Phone size={16} aria-hidden="true" /> Call {DISPLAY_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Avani Loan Services */}
      <section className="why-section section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Our Advisory Approach</span>
            <h2 className="section-title" style={{ marginTop: '10px' }}>Why Clients Consult {OFFICIAL_BUSINESS.name}</h2>
          </div>
          <div className="grid grid-3">
            {ADVISORY_PILLARS.map((item) => (
              <div key={item.title} className="feature-card glass-card">
                <div className="feature-icon" style={{ color: 'var(--primary)' }}>{item.icon}</div>
                <h3 style={{ color: 'var(--primary-deep)' }}>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="cta-banner" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', color: '#ffffff' }}>
        <div className="container text-center">
          <h2 style={{ color: '#ffffff' }}>Need Clear Loan Advisory in Latur or Maharashtra?</h2>
          <p style={{ color: '#e0f2fe', maxWidth: '680px', margin: '10px auto 22px' }}>
            Connect with {OFFICIAL_BUSINESS.name} (Founder: {OFFICIAL_BUSINESS.owner}) for documentation checklists and lender coordination.
          </p>
          <div className="cta-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-secondary">Request Consultation</Link>
            <a
              href={generateWhatsAppDocumentLink('Personal Loan')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#15803d', color: '#ffffff' }}
            >
              <MessageCircle size={17} aria-hidden="true" /> Chat on WhatsApp
            </a>
            <a href={TEL_HREF} className="btn" style={{ background: 'rgba(255,255,255,0.16)', color: '#ffffff', border: '1px solid #bae6fd' }}>
              <Phone size={16} aria-hidden="true" /> {DISPLAY_PHONE}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
