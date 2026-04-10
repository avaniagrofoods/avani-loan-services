import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Loan Products', path: '/loans' },
    { name: 'Eligibility Checker', path: '/eligibility' },
    { name: 'Documents', path: '/documents' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <img src={logo} alt="Avani Loan Services Logo" className="logo" />
          <div className="brand-text">
            <span className="brand-avani">Avani</span>
            <span className="brand-sub">Loan Services</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="btn btn-primary nav-cta">Apply Now</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="mobile-nav animate-fade-in">
            <ul className="mobile-nav-list">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/contact" className="btn btn-primary mobile-cta" onClick={() => setIsOpen(false)}>
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
