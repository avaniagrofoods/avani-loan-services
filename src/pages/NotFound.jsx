import { Link } from 'react-router-dom';
import { Home, Briefcase, Phone } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';

export default function NotFound() {
  useSEO({
    title: 'Page Not Found | Avani Loan Services',
    description: 'The requested page was not found on AVANI LOAN SERVICES.',
    noindex: true
  });

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '680px', textAlign: 'center', padding: '40px 20px' }}>
        <div
          className="glass-card"
          style={{ borderTop: '4px solid var(--primary)', padding: '36px 24px' }}
        >
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>404 — Page Not Found</span>
          <h1 style={{ marginTop: '14px', color: 'var(--primary-deep)' }}>We Could Not Find That Page</h1>
          <p style={{ margin: '12px 0 24px', color: 'var(--text-light)' }}>
            The link you opened may have moved or been typed incorrectly. Use the links below to explore our loan advisory services or contact {OFFICIAL_BUSINESS.name}.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              <Home size={16} aria-hidden="true" /> Go to Homepage
            </Link>
            <Link to="/services" className="btn btn-outline">
              <Briefcase size={16} aria-hidden="true" /> All 8 Loan Services
            </Link>
            <a href={OFFICIAL_BUSINESS.telHref} className="btn btn-outline">
              <Phone size={16} aria-hidden="true" /> Call {OFFICIAL_BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
