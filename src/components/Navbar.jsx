import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Lock, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/optimized/avani-brand-logo.webp';
import { OFFICIAL_BUSINESS, OFFICIAL_SERVICES_NAV } from '../config/officialBusiness';
import './Navbar.css';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const [lastPath, setLastPath] = useState('');
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    if (isOpen) setIsOpen(false);
    if (activeDropdown !== null) setActiveDropdown(null);
    if (mobileSubmenu !== null) setMobileSubmenu(null);
  }

  const toggleMobileSubmenu = (menu) => {
    setMobileSubmenu(mobileSubmenu === menu ? null : menu);
  };

  return (
    <>
      <div className="notice-bar" style={{ background: '#e0f2fe', color: '#0c4a6e', borderBottom: '1px solid #bae6fd' }}>
        <div className="container notice-content">
          <div className="lang-switcher" role="group" aria-label="Language selector">
            <button type="button" className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>
              Eng
            </button>
            <button type="button" className={`lang-btn ${language === 'mr' ? 'active' : ''}`} onClick={() => setLanguage('mr')}>
              मराठी
            </button>
            <button type="button" className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>
              हिंदी
            </button>
          </div>
          <span className="notice-text">
            <strong>{language === 'en' ? 'Advisory Notice' : language === 'mr' ? 'सूचना' : 'सूचना'}:</strong>{' '}
            {t('disclaimer')}{' '}
            <Link to="/disclaimer" className="notice-link" style={{ color: '#0369a1', textDecoration: 'underline', marginLeft: '6px' }}>
              {language === 'en' ? 'Read Disclaimer' : language === 'mr' ? 'अधिक वाचा' : 'और जानें'}
            </Link>
          </span>
          <div className="notice-contact">
            <a href={OFFICIAL_BUSINESS.telHref} className="notice-phone-link" aria-label={`Call ${OFFICIAL_BUSINESS.name}`}>
              <PhoneCall size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} aria-hidden="true" />
              {OFFICIAL_BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <header className="navbar">
        <div className="container nav-container">
          <Link to="/" className="brand" aria-label={`${OFFICIAL_BUSINESS.name} Home`}>
            <img src={logo} alt="Avani Loan Services Logo" className="logo" width="44" height="44" />
            <div className="brand-text">
              <span className="brand-avani">Avani</span>
              <span className="brand-sub">Loan Services</span>
            </div>
          </Link>

          <nav className="desktop-nav" aria-label="Primary Navigation">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  {t('home')}
                </Link>
              </li>

              <li
                className="nav-item has-dropdown"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className={`nav-link dropdown-toggle ${
                    location.pathname.startsWith('/services') || location.pathname === '/loans' ? 'active' : ''
                  }`}
                  aria-expanded={activeDropdown === 'services'}
                  onClick={() => setActiveDropdown(activeDropdown === 'services' ? null : 'services')}
                >
                  <span>{t('loans')}</span>
                  <ChevronDown size={14} className="dropdown-chevron" aria-hidden="true" />
                </button>
                {activeDropdown === 'services' && (
                  <div className="dropdown-menu">
                    <Link to="/services" className="dropdown-item featured">
                      <strong>All 8 Loan Advisory Services</strong>
                      <small>Overview &amp; documentation checklists</small>
                    </Link>
                    <div className="dropdown-divider" />
                    {OFFICIAL_SERVICES_NAV.map((svc) => (
                      <Link key={svc.slug} to={`/services/${svc.slug}`} className="dropdown-item">
                        {svc.name}
                      </Link>
                    ))}
                    <div className="dropdown-divider" />
                    <Link to="/loans" className="dropdown-item all-link">
                      Property &amp; Loan Guides →
                    </Link>
                  </div>
                )}
              </li>

              <li
                className="nav-item has-dropdown"
                onMouseEnter={() => setActiveDropdown('calculators')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className={`nav-link dropdown-toggle ${
                    location.pathname.startsWith('/financial-tools') ||
                    location.pathname.startsWith('/calculators') ||
                    location.pathname === '/eligibility' ||
                    location.pathname === '/cibil-check' ||
                    location.pathname === '/documents'
                      ? 'active'
                      : ''
                  }`}
                  aria-expanded={activeDropdown === 'calculators'}
                  onClick={() => setActiveDropdown(activeDropdown === 'calculators' ? null : 'calculators')}
                >
                  <span>Tools &amp; Guides</span>
                  <ChevronDown size={14} className="dropdown-chevron" aria-hidden="true" />
                </button>
                {activeDropdown === 'calculators' && (
                  <div className="dropdown-menu">
                    <Link to="/financial-tools" className="dropdown-item featured">
                      <strong>Financial Calculator Suite</strong>
                      <small>EMI, FOIR, SIP &amp; planning tools</small>
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/financial-tools/loan/emi" className="dropdown-item">
                      EMI Calculator
                    </Link>
                    <Link to="/eligibility" className="dropdown-item">
                      Indicative Eligibility Estimator
                    </Link>
                    <Link to="/cibil-check" className="dropdown-item">
                      Credit Score Readiness Guide
                    </Link>
                    <Link to="/documents" className="dropdown-item">
                      Document Checklists
                    </Link>
                  </div>
                )}
              </li>

              <li className="nav-item">
                <Link to="/blog" className={`nav-link ${location.pathname.startsWith('/blog') ? 'active' : ''}`}>
                  {t('blog')}
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                  {t('about')}
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                  {t('contact')}
                </Link>
              </li>
            </ul>

            <div className="nav-actions">
              <Link to="/admin/login" className="btn-admin-portal" title="Protected Admin Portal" rel="nofollow">
                <Lock size={13} style={{ marginRight: '5px' }} aria-hidden="true" />
                <span>Admin</span>
              </Link>
              <Link to="/contact" className="btn btn-primary nav-cta">
                {t('apply_now')}
              </Link>
            </div>
          </nav>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
          </button>

          {isOpen && (
            <div className="mobile-nav">
              <ul className="mobile-nav-list">
                <li>
                  <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    {t('home')}
                  </Link>
                </li>

                <li className="mobile-accordion">
                  <button type="button" className="mobile-accordion-toggle" onClick={() => toggleMobileSubmenu('services')}>
                    <span>{t('loans')}</span>
                    <ChevronDown size={16} className={`accordion-icon ${mobileSubmenu === 'services' ? 'rotate' : ''}`} aria-hidden="true" />
                  </button>
                  {mobileSubmenu === 'services' && (
                    <div className="mobile-submenu">
                      <Link to="/services" onClick={() => setIsOpen(false)}>All 8 Loan Advisory Services</Link>
                      {OFFICIAL_SERVICES_NAV.map((svc) => (
                        <Link key={svc.slug} to={`/services/${svc.slug}`} onClick={() => setIsOpen(false)}>
                          {svc.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>

                <li className="mobile-accordion">
                  <button type="button" className="mobile-accordion-toggle" onClick={() => toggleMobileSubmenu('tools')}>
                    <span>Tools &amp; Guides</span>
                    <ChevronDown size={16} className={`accordion-icon ${mobileSubmenu === 'tools' ? 'rotate' : ''}`} aria-hidden="true" />
                  </button>
                  {mobileSubmenu === 'tools' && (
                    <div className="mobile-submenu">
                      <Link to="/financial-tools" onClick={() => setIsOpen(false)}>Financial Calculator Suite</Link>
                      <Link to="/financial-tools/loan/emi" onClick={() => setIsOpen(false)}>EMI Calculator</Link>
                      <Link to="/eligibility" onClick={() => setIsOpen(false)}>Indicative Eligibility Estimator</Link>
                      <Link to="/cibil-check" onClick={() => setIsOpen(false)}>Credit Score Readiness Guide</Link>
                      <Link to="/documents" onClick={() => setIsOpen(false)}>Document Checklists</Link>
                    </div>
                  )}
                </li>

                <li>
                  <Link to="/blog" className={`mobile-nav-link ${location.pathname.startsWith('/blog') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    {t('blog')}
                  </Link>
                </li>

                <li>
                  <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    {t('about')}
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    {t('contact')}
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className="btn btn-primary mobile-cta" onClick={() => setIsOpen(false)}>
                    {t('apply_now')}
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
