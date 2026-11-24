import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, Phone, MessageCircle, Calculator } from 'lucide-react';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import './BottomNavbar.css';

export default function BottomNavbar() {
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} aria-hidden="true" />, label: 'Home', path: '/' },
    { icon: <Briefcase size={20} aria-hidden="true" />, label: 'Services', path: '/services' },
    { icon: <Calculator size={20} aria-hidden="true" />, label: 'Tools', path: '/financial-tools' },
    { icon: <FileText size={20} aria-hidden="true" />, label: 'Docs', path: '/documents' },
    {
      icon: <Phone size={20} aria-hidden="true" />,
      label: 'Call',
      href: OFFICIAL_BUSINESS.telHref,
      external: false
    },
    {
      icon: <MessageCircle size={20} aria-hidden="true" />,
      label: 'WhatsApp',
      href: `${OFFICIAL_BUSINESS.whatsappUrl}?text=${encodeURIComponent('Hello AVANI LOAN SERVICES, I would like loan advisory assistance.')}`,
      external: true
    }
  ];

  return (
    <nav className="bottom-navbar" id="bottom-navbar" aria-label="Mobile Quick Navigation">
      {navItems.map((item) => {
        if (item.href) {
          return (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={`bottom-nav-item ${item.external ? 'bottom-nav-whatsapp' : ''}`}
              aria-label={item.label}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </a>
          );
        }
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            aria-label={item.label}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
