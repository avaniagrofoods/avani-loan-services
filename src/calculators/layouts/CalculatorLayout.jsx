// src/calculators/layouts/CalculatorLayout.jsx
// ─────────────────────────────────────────────────────────────────
// Main Suite Layout with Topbar, Brand Header, Breadcrumbs & Logout
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCalculatorAuth } from '../auth/CalculatorAuthContext';
import {
  Calculator,
  LogOut,
  LayoutDashboard,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import logo from '../../assets/avani-brand-logo.png';
import '../styles/calculators.css';

export default function CalculatorLayout({ children }) {
  const { logout } = useCalculatorAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/calculators/login', { replace: true });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="calc-suite-container animate-fade-in">
      {/* Top Suite Bar */}
      <header className="calc-topbar">
        <Link to="/calculators" className="calc-topbar-brand">
          <img src={logo} alt="AVANI LOAN SERVICES Logo" className="calc-topbar-logo" />
          <div>
            <h1 className="calc-topbar-title">AVANI LOAN SERVICES</h1>
            <p className="calc-topbar-subtitle">Financial Calculator Suite</p>
          </div>
        </Link>

        <div className="calc-topbar-actions">
          <Link to="/calculators" className="calc-btn calc-btn-secondary calc-btn-sm">
            <LayoutDashboard size={16} />
            <span>All Calculators</span>
          </Link>

          <button
            onClick={handlePrint}
            className="calc-btn calc-btn-secondary calc-btn-sm"
            title="Print this financial calculation"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <span className="calc-badge-auth" title="Authenticated Session Active">
            <ShieldCheck size={14} />
            <span>Authorized</span>
          </span>

          <button
            onClick={handleLogout}
            className="calc-btn calc-btn-outline calc-btn-sm"
            title="Logout of Financial Calculator Suite"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Calculator Content */}
      <main id="calculator-printable-area">
        {children}
      </main>
    </div>
  );
}
