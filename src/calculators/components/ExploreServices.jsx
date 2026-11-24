// src/calculators/components/ExploreServices.jsx
// ─────────────────────────────────────────────────────────────────
// Contextual Loan Products & Service Recommendations Component
// Connects financial calculations to official AVANI LOAN SERVICES solutions
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Home,
  Building2,
  FileCheck,
  Stethoscope,
  BookOpen,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import '../styles/calculators.css';

export const LOAN_SERVICES = [
  {
    id: 'personal-loan',
    title: 'Personal Loan',
    subtitle: 'Loan advisory for salaried professionals',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/personal-loan',
    calcLink: '/financial-tools/loan/emi',
    icon: <Briefcase size={20} />,
    description: 'Transparent loan advisory, document checklist guidance, and lender coordination for salaried individuals across Maharashtra.',
    calcTags: ['emi', 'foir', 'multiplier', 'outstanding', 'prepayment', 'rate-change']
  },
  {
    id: 'business-loan',
    title: 'Business Loan',
    subtitle: 'Working capital & expansion advisory',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/business-loan',
    calcLink: '/financial-tools/loan/overdraft',
    icon: <Building2 size={20} />,
    description: 'Independent loan consultancy and documentation checklists for MSMEs, traders, proprietors, and practicing professionals.',
    calcTags: ['emi', 'foir', 'multiplier', 'overdraft', 'outstanding', 'foreclosure']
  },
  {
    id: 'education-loan-india',
    title: 'Education Loan — India',
    subtitle: 'Domestic higher-education loan advisory',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/education-loan-india',
    calcLink: '/financial-tools/loan/emi',
    icon: <GraduationCap size={20} />,
    description: 'Structured admission-letter, co-applicant, and fee-schedule documentation guidance for recognized Indian institutions.',
    calcTags: ['emi', 'foir', 'outstanding', 'interest']
  },
  {
    id: 'education-loan-global',
    title: 'Education Loan — Global Studies',
    subtitle: 'Overseas university financing advisory',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/education-loan-global-studies',
    calcLink: '/financial-tools/loan/emi',
    icon: <GraduationCap size={20} />,
    description: 'Advisory support for international university offer readiness, cost-of-attendance checklists, and partner lender coordination.',
    calcTags: ['emi', 'foir', 'gst-interest', 'interest']
  },
  {
    id: 'home-loan',
    title: 'Home Loan',
    subtitle: 'Purchase, construction & renovation advisory',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/home-loan',
    calcLink: '/financial-tools/loan/comparison',
    icon: <Home size={20} />,
    description: 'Income, co-applicant, and property title chain checklist guidance for home purchase, self-construction, or balance transfer.',
    calcTags: ['emi', 'foir', 'comparison', 'prepayment', 'rate-change', 'foreclosure']
  },
  {
    id: 'mortgage-lap',
    title: 'Mortgage Loan (LAP)',
    subtitle: 'Loan against residential/commercial property',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/mortgage-loan',
    calcLink: '/financial-tools/loan/emi',
    icon: <Building2 size={20} />,
    description: 'Secured financing consultancy and property title documentation preparation for residential and commercial property owners.',
    calcTags: ['emi', 'foir', 'multiplier', 'outstanding', 'foreclosure']
  },
  {
    id: 'ca-loan',
    title: 'Chartered Accountant & Professional Advisory',
    subtitle: 'Practice expansion & working capital guidance',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/business-loan',
    calcLink: '/financial-tools/loan/multiplier-eligibility',
    icon: <FileCheck size={20} />,
    description: 'Documentation checklists and partner lender coordination for practicing Chartered Accountants and certified professionals.',
    calcTags: ['emi', 'multiplier', 'foir', 'outstanding']
  },
  {
    id: 'doctor-loan',
    title: 'Doctor Loan',
    subtitle: 'Clinic setup & medical equipment advisory',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/doctor-loan',
    calcLink: '/financial-tools/loan/foir-eligibility',
    icon: <Stethoscope size={20} />,
    description: 'Dedicated loan consultancy for MBBS, MD, MS, BDS, MDS, and registered medical practitioners across Maharashtra.',
    calcTags: ['emi', 'foir', 'multiplier', 'outstanding', 'foreclosure']
  },
  {
    id: 'school-college-funding',
    title: 'School and College Funding',
    subtitle: 'Institutional expansion & campus infrastructure',
    rate: 'As per partner lender policy',
    tenure: 'Subject to lender terms',
    link: '/services/school-and-college-funding',
    calcLink: '/financial-tools/loan/comparison',
    icon: <BookOpen size={20} />,
    description: 'Institutional loan consultancy and 3-year audited financial pack guidance for recognized educational trusts, schools, and colleges.',
    calcTags: ['emi', 'comparison', 'interest', 'foir']
  }
];

export default function ExploreServices({ currentCalcTag, heading = "Explore Our Loan Services" }) {
  // Sort or prioritize relevant services if a currentCalcTag is provided
  const servicesToDisplay = React.useMemo(() => {
    if (!currentCalcTag) return LOAN_SERVICES;
    return [...LOAN_SERVICES].sort((a, b) => {
      const aHas = a.calcTags.includes(currentCalcTag) ? 1 : 0;
      const bHas = b.calcTags.includes(currentCalcTag) ? 1 : 0;
      return bHas - aHas;
    });
  }, [currentCalcTag]);

  return (
    <section className="calc-explore-services animate-fade-in" aria-labelledby="explore-services-title">
      <div className="calc-explore-header">
        <div className="calc-explore-badge">
          <Sparkles size={14} />
          <span>Independent Loan Consultancy</span>
        </div>
        <h3 id="explore-services-title" className="calc-explore-title">
          {heading}
        </h3>
        <p className="calc-explore-desc">
          Reviewed your indicative estimates? Speak with our loan advisory desk for documentation checklists and partner lender coordination.
        </p>
      </div>

      <div className="calc-explore-grid">
        {servicesToDisplay.map((service) => (
          <div key={service.id} className="calc-service-card">
            <div className="calc-service-top">
              <div className="calc-service-icon-box">{service.icon}</div>
              <div className="calc-service-rates">
                <span className="calc-service-rate-badge">{service.rate}</span>
                <span className="calc-service-tenure">{service.tenure}</span>
              </div>
            </div>

            <h4 className="calc-service-name">{service.title}</h4>
            <p className="calc-service-subtitle">{service.subtitle}</p>
            <p className="calc-service-text">{service.description}</p>

            <div className="calc-service-actions">
              <Link to={service.link} className="calc-service-primary-btn">
                <span>View Details</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES,%20I%20am%20interested%20in%20${encodeURIComponent(service.title)}.%20Please%20guide%20me.`}
                target="_blank"
                rel="noopener noreferrer"
                className="calc-service-wa-btn"
                title={`Enquire on WhatsApp for ${service.title}`}
              >
                <MessageCircle size={15} />
                <span>Enquire</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="calc-explore-cta-banner">
        <div className="calc-cta-info">
          <h4>Need personalized loan advisory guidance?</h4>
          <p>Connect with AVANI LOAN SERVICES in Latur for transparent document checklists and lender coordination across Maharashtra.</p>
        </div>
        <div className="calc-cta-buttons">
          <a href="tel:+919175635165" className="calc-btn calc-btn-primary">
            <PhoneCall size={16} />
            <span>Call +91-9175635165</span>
          </a>
          <Link to="/contact" className="calc-btn calc-btn-secondary">
            <span>Book Free Consultation</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
