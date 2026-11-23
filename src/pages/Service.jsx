import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MessageCircle, Phone, ArrowRight, CheckCircle2, FileText, Users, ShieldCheck, ClipboardList } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import services from '../data/services.json';
import { OFFICIAL_BUSINESS, LEGACY_SERVICE_SLUG_MAP } from '../config/officialBusiness';
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

export default function Service() {
  const { slug } = useParams();
  const redirectedSlug = LEGACY_SERVICE_SLUG_MAP[slug];
  const service = services.find((s) => s.slug === slug);

  useSEO({
    title: service ? service.title : 'Service Not Found | Avani Loan Services',
    description: service
      ? service.metaDescription
      : 'Explore all eight official loan consultancy services offered by AVANI LOAN SERVICES in Latur & Maharashtra.',
    keywords: service ? (service.keywords || []).join(', ') : 'Avani Loan Services, Loan Consultancy Latur',
    canonical: service ? `${OFFICIAL_BUSINESS.websiteUrl}/services/${service.slug}` : undefined,
    noindex: !service
  });

  useEffect(() => {
    if (!service) return undefined;
    const existing = document.getElementById('service-json-ld');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'service-json-ld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.h1,
      serviceType: OFFICIAL_BUSINESS.category,
      description: service.metaDescription,
      url: `${OFFICIAL_BUSINESS.websiteUrl}/services/${service.slug}`,
      provider: {
        '@type': 'FinancialService',
        name: OFFICIAL_BUSINESS.name,
        url: OFFICIAL_BUSINESS.websiteUrl,
        telephone: OFFICIAL_BUSINESS.phoneE164,
        email: OFFICIAL_BUSINESS.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: OFFICIAL_BUSINESS.streetAddress,
          addressLocality: OFFICIAL_BUSINESS.city,
          addressRegion: OFFICIAL_BUSINESS.state,
          postalCode: OFFICIAL_BUSINESS.pinCode,
          addressCountry: 'IN'
        }
      },
      areaServed: ['Latur', 'Maharashtra', 'India']
    });
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('service-json-ld');
      if (el) el.remove();
    };
  }, [service]);

  if (redirectedSlug) {
    return <Navigate to={`/services/${redirectedSlug}`} replace />;
  }

  if (!service) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: '720px', textAlign: 'center' }}>
          <h1>Service Not Found</h1>
          <p style={{ margin: '14px 0 22px', color: 'var(--text-light)' }}>
            We could not find the requested loan service page. Please browse our eight official loan advisory categories.
          </p>
          <Link to="/services" className="btn btn-primary">
            View All 8 Official Services <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const relatedServices = services.filter((s) => s.slug !== service.slug);

  return (
    <div className="service-detail-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">{OFFICIAL_BUSINESS.category}</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <nav aria-label="Breadcrumb" style={{ marginBottom: '10px', fontSize: '0.88rem' }}>
            <Link to="/" style={{ textDecoration: 'underline' }}>Home</Link> /{' '}
            <Link to="/services" style={{ textDecoration: 'underline' }}>Services</Link> /{' '}
            <span>{service.h1}</span>
          </nav>
          <h1>{service.h1} Advisory</h1>
          <p>{service.summary}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '980px' }}>
          {/* Hero Visual + Disclosure */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <img
                src={IMAGE_MAP[service.imageKey] || personalImg}
                alt={`${service.h1} loan consultancy service`}
                width="480"
                height="290"
                style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '10px' }}
              />
              <div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-deep)', marginBottom: '10px' }}>
                  Service Overview
                </h2>
                <p style={{ color: 'var(--text-dark)', marginBottom: '14px' }}>{service.summary}</p>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--secondary-soft)',
                    border: '1px solid #fcd34d',
                    color: '#78350f',
                    fontSize: '0.88rem'
                  }}
                >
                  <strong>Advisory Role:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
                </div>
              </div>
            </div>
          </div>

          {/* Target Customers & Eligibility */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-deep)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#0369a1" aria-hidden="true" /> Suitable Target Customers
              </h2>
              <ul style={{ display: 'grid', gap: '10px' }}>
                {(service.targetCustomers || []).map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--text-dark)', fontSize: '0.94rem' }}>
                    <CheckCircle2 size={17} color="#0369a1" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-deep)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#0369a1" aria-hidden="true" /> Indicative Eligibility Parameters
              </h2>
              <ul style={{ display: 'grid', gap: '10px' }}>
                {(service.eligibility || []).map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--text-dark)', fontSize: '0.94rem' }}>
                    <CheckCircle2 size={17} color="#d97706" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Documentation Checklist */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#0369a1" aria-hidden="true" /> Typical Documentation Checklist
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '14px' }}>
              Exact documentation requirements vary by bank/NBFC underwriting policy and applicant profile.
            </p>
            <ul style={{ display: 'grid', gap: '10px' }}>
              {(service.documents || []).map((doc) => (
                <li key={doc} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--text-dark)', fontSize: '0.94rem' }}>
                  <CheckCircle2 size={17} color="#15803d" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Process */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={20} color="#0369a1" aria-hidden="true" /> How Our Advisory Process Works
            </h2>
            <ol style={{ display: 'grid', gap: '12px', paddingLeft: '20px', color: 'var(--text-dark)' }}>
              {(service.processSteps || []).map((stepText) => (
                <li key={stepText} style={{ fontSize: '0.95rem' }}>{stepText}</li>
              ))}
            </ol>
          </div>

          {/* FAQs */}
          {(service.faqs || []).length > 0 && (
            <div className="glass-card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '14px' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {service.faqs.map((faq) => (
                  <div key={faq.q} style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--text-dark)' }}>{faq.q}</h3>
                    <p style={{ margin: 0, fontSize: '0.93rem', color: 'var(--text-light)' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy, Consent & Consultation CTA */}
          <div
            className="glass-card"
            style={{ background: 'var(--primary-soft)', border: '1px solid var(--border)', marginBottom: '28px' }}
          >
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', marginBottom: '8px' }}>
              Request {service.h1} Advisory Consultation
            </h2>
            <p style={{ color: 'var(--text-dark)', marginBottom: '12px' }}>
              Speak with {OFFICIAL_BUSINESS.name} for clear documentation guidance. All enquiries require explicit consent and are governed by our{' '}
              <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</Link> and{' '}
              <Link to="/disclaimer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Financial Disclaimer</Link>.
            </p>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-light)', marginBottom: '18px' }}>
              {OFFICIAL_BUSINESS.noAdvanceFeeNotice}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to={`/contact?product=${encodeURIComponent(service.h1)}`} className="btn btn-primary">
                Enquire Online <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={generateWhatsAppDocumentLink(service.whatsappProduct)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: '#15803d', color: '#ffffff' }}
                aria-label={`Get ${service.h1} document checklist on WhatsApp`}
              >
                <MessageCircle size={17} aria-hidden="true" /> Get Checklist on WhatsApp
              </a>
              <a
                href={TEL_HREF}
                className="btn btn-outline"
                aria-label={`Call ${OFFICIAL_BUSINESS.name} at ${DISPLAY_PHONE}`}
              >
                <Phone size={16} aria-hidden="true" /> Call {DISPLAY_PHONE}
              </a>
              <Link to="/financial-tools/loan/emi" className="btn btn-outline">
                EMI Calculator
              </Link>
            </div>
          </div>

          {/* Internal Links to Other Official Services */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', color: 'var(--primary-deep)', marginBottom: '12px' }}>
              Explore Other Official Loan Advisory Services
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {relatedServices.map((rel) => (
                <Link key={rel.slug} to={`/services/${rel.slug}`} className="btn btn-outline" style={{ fontSize: '0.88rem', padding: '8px 14px' }}>
                  {rel.h1}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
