import useSEO from '../hooks/useSEO';
import SimpleLeadForm from '../components/SimpleLeadForm';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import logo from '../assets/optimized/avani-brand-logo.webp';
import './Contact.css';

export default function Contact() {
  useSEO({
    title: 'Contact Avani Loan Services — Latur, Maharashtra',
    description:
      'Contact AVANI LOAN SERVICES in Latur (413512), Maharashtra for transparent loan advisory, documentation guidance, and WhatsApp consultation.',
    keywords: 'Contact Avani Loan Services, Latur 413512 loan advisor, enquiry avanifinserv, loan consultancy Maharashtra'
  });

  return (
    <div className="contact-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={logo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Get in Touch</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Contact {OFFICIAL_BUSINESS.name}</h1>
          <p>Submit your loan advisory enquiry below or connect directly by phone, email, or WhatsApp during business hours.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-container">
          <div className="contact-form-col">
            <div className="contact-form-wrapper">
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '8px', color: 'var(--primary-deep)' }}>
                Request Loan Advisory Consultation
              </h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
                Share your basic requirement below. All enquiries require explicit consent and are handled per our Privacy Policy.
              </p>
              <SimpleLeadForm />
            </div>
          </div>

          <div className="contact-info-col">
            <div className="contact-info-card glass-card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '14px', color: 'var(--primary-deep)' }}>Official Office Details</h2>
              <div className="info-row">
                <MapPin size={20} color="#0369a1" aria-hidden="true" />
                <span>
                  <strong>{OFFICIAL_BUSINESS.name}</strong>
                  <br />
                  {OFFICIAL_BUSINESS.fullAddress}
                  <br />
                  <small>Owner &amp; Founder: {OFFICIAL_BUSINESS.owner} | Service Area: {OFFICIAL_BUSINESS.serviceArea}</small>
                </span>
              </div>
              <div className="info-row">
                <Phone size={20} color="#0369a1" aria-hidden="true" />
                <a href={OFFICIAL_BUSINESS.telHref}>{OFFICIAL_BUSINESS.phoneDisplay}</a>
              </div>
              <div className="info-row">
                <Mail size={20} color="#0369a1" aria-hidden="true" />
                <a href={OFFICIAL_BUSINESS.emailHref}>{OFFICIAL_BUSINESS.email}</a>
              </div>
            </div>

            <div className="contact-info-card glass-card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--primary-deep)' }}>Office Hours</h2>
              <div className="hours-row"><span>Monday – Saturday</span><span>9:30 AM – 7:00 PM</span></div>
              <div className="hours-row"><span>Sunday</span><span>By Appointment</span></div>
            </div>

            <a
              href={`${OFFICIAL_BUSINESS.whatsappUrl}?text=${encodeURIComponent('Hello AVANI LOAN SERVICES, I would like loan advisory guidance.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-contact-btn"
              style={{ background: '#15803d', color: '#ffffff' }}
            >
              <MessageCircle size={24} aria-hidden="true" />
              <div>
                <strong>Chat on WhatsApp ({OFFICIAL_BUSINESS.phoneDisplay})</strong>
                <span>Direct advisory enquiry via official WhatsApp Business</span>
              </div>
            </a>

            <div
              className="contact-info-card glass-card"
              style={{ background: 'var(--secondary-soft)', border: '1px solid #fcd34d', color: '#78350f', fontSize: '0.88rem' }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <p style={{ margin: 0 }}>{OFFICIAL_BUSINESS.noAdvanceFeeNotice}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
