import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import services from '../data/services.json';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import personalImg from '../assets/optimized/personal-loan.webp';
import businessImg from '../assets/optimized/business-loan.webp';
import doctorImg from '../assets/optimized/doctor-loan.webp';
import homeImg from '../assets/optimized/home-loan.webp';
import mortgageImg from '../assets/optimized/mortgage-loan.webp';
import educationImg from '../assets/optimized/education-loan.webp';

const IMAGE_MAP = {
  personal: personalImg,
  business: businessImg,
  doctor: doctorImg,
  home: homeImg,
  mortgage: mortgageImg,
  education: educationImg
};

export default function ServicesList() {
  useSEO({
    title: 'All 8 Loan Advisory Services | Avani Loan Services Latur',
    description:
      'Explore all eight official loan consultancy services offered by AVANI LOAN SERVICES in Latur & Maharashtra: Personal, Business, Doctor, Home, Mortgage, Education (India & Global), and School & College Funding.',
    keywords:
      'Personal Loan, Business Loan, Doctor Loan, Home Loan, Mortgage Loan, Education Loan India, Education Loan Global Studies, School and College Funding, Avani Loan Services'
  });

  return (
    <div className="services-list-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Official Loan Consultancy Services</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Our 8 Official Loan Advisory Services</h1>
          <p>
            Independent loan advisory, documentation preparation, and lender coordination across retail, professional, enterprise, education, and institutional categories.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            className="glass-card"
            style={{
              background: 'var(--secondary-soft)',
              border: '1px solid #fcd34d',
              marginBottom: '32px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}
          >
            <ShieldCheck size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <p style={{ margin: 0, color: '#78350f', fontSize: '0.93rem' }}>
              <strong>Consultancy Disclosure:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {services.map((svc, idx) => (
              <article
                key={svc.slug}
                className="glass-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px' }}
              >
                <div>
                  <img
                    src={IMAGE_MAP[svc.imageKey] || personalImg}
                    alt={`${svc.h1} advisory service`}
                    width="400"
                    height="220"
                    loading="lazy"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      marginBottom: '8px'
                    }}
                  >
                    Service {idx + 1} of 8
                  </span>
                  <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', marginBottom: '8px' }}>{svc.h1}</h2>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.94rem', marginBottom: '14px' }}>{svc.summary}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <Link to={`/services/${svc.slug}`} className="btn btn-primary" style={{ flex: '1 1 auto' }}>
                    Full Service Guide <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <a
                    href={generateWhatsAppDocumentLink(svc.whatsappProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: '#15803d', color: '#ffffff' }}
                    aria-label={`Get ${svc.h1} checklist on WhatsApp`}
                  >
                    <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="glass-card" style={{ marginTop: '36px', textAlign: 'center', background: 'var(--primary-soft)' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-deep)', marginBottom: '8px' }}>
              Not Sure Which Category Fits Your Requirement?
            </h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '640px', margin: '0 auto 18px' }}>
              Speak with our Latur advisory desk for clear documentation guidance before submitting any formal lender application.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Request Advisory Callback</Link>
              <a href={TEL_HREF} className="btn btn-outline">
                <Phone size={16} aria-hidden="true" /> Call {DISPLAY_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
