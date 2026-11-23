import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import logo from '../assets/optimized/avani-brand-logo.webp';
import { OFFICIAL_BUSINESS, OFFICIAL_SERVICES_NAV } from '../config/officialBusiness';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="footer" style={{ background: '#0c4a6e', color: '#f0f9ff' }}>
      <div className="container">
        <div className="footer-grid grid grid-4">
          <div className="footer-col">
            <img src={logo} alt="Avani Loan Services Logo" className="footer-logo" width="52" height="52" />
            <h3 className="footer-brand">{OFFICIAL_BUSINESS.name}</h3>
            <p style={{ fontSize: '0.84rem', color: '#fde68a', fontWeight: 600, marginBottom: '8px' }}>
              {OFFICIAL_BUSINESS.category}
            </p>
            <p className="footer-desc">{t('footer_desc')}</p>
            <p style={{ fontSize: '0.82rem', color: '#bae6fd', marginTop: '8px' }}>
              Founder &amp; Owner: <strong>{OFFICIAL_BUSINESS.owner}</strong>
            </p>
            <div className="social-links">
              <a
                href="https://www.facebook.com/share/19Pvp8PqP2/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="AVANI LOAN SERVICES on Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/avanifinservlatur/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="AVANI LOAN SERVICES on Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">{t('quick_links')}</h4>
            <ul className="footer-links">
              <li><Link to="/about">{t('about')}</Link></li>
              <li><Link to="/services">All Loan Services</Link></li>
              <li><Link to="/loans">Loan Guides &amp; Property Docs</Link></li>
              <li><Link to="/eligibility">{t('eligibility')}</Link></li>
              <li><Link to="/documents">{t('documents')}</Link></li>
              <li><Link to="/cibil-check">Credit Score Readiness Guide</Link></li>
              <li><Link to="/financial-tools">Financial Calculators</Link></li>
              <li><Link to="/blog">{t('blog')}</Link></li>
              <li><Link to="/contact">{t('contact')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">{t('loans')}</h4>
            <ul className="footer-links">
              {OFFICIAL_SERVICES_NAV.map((svc) => (
                <li key={svc.slug}>
                  <Link to={`/services/${svc.slug}`}>{svc.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">{t('contact_us')}</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={18} className="contact-icon" aria-hidden="true" />
                <span>
                  {OFFICIAL_BUSINESS.fullAddress}
                  <br />
                  <small>{OFFICIAL_BUSINESS.serviceArea}</small>
                </span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" aria-hidden="true" />
                <a href={OFFICIAL_BUSINESS.telHref} className="footer-contact-link" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {OFFICIAL_BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <Mail size={18} className="contact-icon" aria-hidden="true" />
                <a href={OFFICIAL_BUSINESS.emailHref} className="footer-contact-link" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {OFFICIAL_BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(186,230,253,0.25)',
            fontSize: '0.82rem',
            color: '#e0f2fe',
            lineHeight: 1.5
          }}
        >
          <strong>Loan Consultancy Disclosure:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {OFFICIAL_BUSINESS.name}. {t('rights_reserved')}</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">{language === 'en' ? 'Privacy Policy' : language === 'mr' ? 'गोपनीयता धोरण' : 'गोपनीयता नीति'}</Link>
            <span className="footer-divider" aria-hidden="true" style={{ margin: '0 8px', color: '#7dd3fc' }}>•</span>
            <Link to="/terms">{language === 'en' ? 'Terms & Conditions' : language === 'mr' ? 'नियम व अटी' : 'नियम और शर्तें'}</Link>
            <span className="footer-divider" aria-hidden="true" style={{ margin: '0 8px', color: '#7dd3fc' }}>•</span>
            <Link to="/disclaimer">{language === 'en' ? 'Disclaimer' : language === 'mr' ? 'अस्वीकरण' : 'अस्वीकरण'}</Link>
            <span className="footer-divider" aria-hidden="true" style={{ margin: '0 8px', color: '#7dd3fc' }}>•</span>
            <Link to="/admin/login" className="admin-portal-footer-link" rel="nofollow">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
