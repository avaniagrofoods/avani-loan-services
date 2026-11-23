import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, MessageCircle, Phone, FileText, Globe, GraduationCap, Building2 } from 'lucide-react';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import './Loans.css';
import services from '../data/services.json';

// Optimized WebP Images
import personalImg from '../assets/optimized/personal-loan.webp';
import businessImg from '../assets/optimized/business-loan.webp';
import educationImg from '../assets/optimized/education-loan.webp';
import homeImg from '../assets/optimized/home-loan.webp';
import mortgageImg from '../assets/optimized/mortgage-loan.webp';
import doctorImg from '../assets/optimized/doctor-loan.webp';

const loans = [
  {
    id: 'personal',
    slug: 'personal-loan',
    image: personalImg,
    title: 'Personal Loan',
    tagline: 'Independent advisory for salaried individuals',
    description: 'Loan consultancy and documentation coordination for salaried professionals evaluating unsecured personal financing with partner banks and NBFCs.',
    minAmount: 'As per lender', maxAmount: 'Subject to income',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Structured document checklist guidance', 'FOIR & EMI planning support', 'Comparison of standard lender criteria', 'Salary slip & bank statement review', 'Transparent advisory with no advance cash fees'],
  },
  {
    id: 'business',
    slug: 'business-loan',
    image: businessImg,
    title: 'Business Loan',
    tagline: 'Working capital & expansion advisory for MSMEs',
    description: 'Consultancy and application coordination for proprietors, partnership firms, MSMEs, traders, and practicing professionals in Maharashtra.',
    minAmount: 'As per lender', maxAmount: 'Subject to turnover',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Term loan & working capital advisory', 'GST, Udyam & ITR readiness checklist', '12-month business banking review', 'Support for Chartered Accountants & MSMEs', 'Final limits & pricing set solely by partner lenders'],
  },
  {
    id: 'doctor',
    slug: 'doctor-loan',
    image: doctorImg,
    title: 'Doctor Loan',
    tagline: 'Dedicated advisory for medical practitioners',
    description: 'Specialized loan consultancy for MBBS, MD, MS, BDS, MDS, and registered healthcare practitioners planning clinic setup or medical equipment financing.',
    minAmount: 'As per lender', maxAmount: 'Subject to profile',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Degree & Medical Council registration alignment', 'Clinic setup & equipment quotation guidance', 'Salaried & self-employed practitioner support', 'Clean ITR & banking file preparation', 'Partner lender underwriting & terms apply'],
  },
  {
    id: 'home',
    slug: 'home-loan',
    image: homeImg,
    title: 'Home Loan',
    tagline: 'Home purchase, construction & balance transfer guidance',
    description: 'Loan consultancy for homebuyers purchasing ready/under-construction residences, self-construction on owned plots, or reviewing balance transfers.',
    minAmount: 'As per lender', maxAmount: 'Subject to valuation',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Income & co-applicant eligibility planning', 'Property title & NA/sanctioned plan checklist', 'Coordination for bank legal & technical appraisal', 'Balance transfer & EMI estimation tools', 'LTV and final rate decided solely by the lender'],
  },
  {
    id: 'mortgage',
    slug: 'mortgage-loan',
    image: mortgageImg,
    title: 'Mortgage Loan',
    tagline: 'Loan Against Property (LAP) advisory',
    description: 'Secured loan consultancy for residential and commercial property owners raising structured financing against marketable property collateral.',
    minAmount: 'As per lender', maxAmount: 'Subject to valuation',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Residential & commercial property checklists', 'Co-owner & title-chain documentation guidance', 'ITR & business cashflow review', 'Independent lender valuation & legal scrutiny', 'Terms & LTV strictly governed by lender policy'],
  },
  {
    id: 'education-india',
    slug: 'education-loan-india',
    image: educationImg,
    title: 'Education Loan — India',
    tagline: 'Domestic higher-education loan consultancy',
    description: 'Advisory support for students and parents arranging financing for recognized undergraduate, postgraduate, engineering, medical, or management degrees in India.',
    minAmount: 'As per lender', maxAmount: 'Subject to course',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Admission letter & fee schedule alignment', 'Co-applicant KYC & income checklist', 'Clarification of moratorium norms per lender', 'Direct institute fee disbursement process overview', 'Final sanction subject to bank/NBFC policy'],
  },
  {
    id: 'education-global',
    slug: 'education-loan-global-studies',
    image: educationImg,
    title: 'Education Loan — Global Studies',
    tagline: 'Overseas university financing advisory',
    description: 'Consultancy for Indian students pursuing accredited global degrees (MS, MBA, UG, MBBS abroad) covering cost-of-attendance and co-applicant documentation.',
    minAmount: 'As per lender', maxAmount: 'Subject to course',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['University offer / I-20 / CAS checklist readiness', 'Secured & unsecured lender criteria overview', 'Co-applicant ITR & collateral file guidance', 'Aligned ahead of university & visa timelines', 'Sanction & remittance handled solely by lender'],
  },
  {
    id: 'school-college-funding',
    slug: 'school-and-college-funding',
    image: educationImg,
    title: 'School and College Funding',
    tagline: 'Institutional advisory for educational trusts',
    description: 'Dedicated institutional loan consultancy for recognized schools, colleges, and educational trusts planning campus expansion, classrooms, labs, or transport.',
    minAmount: 'As per lender', maxAmount: 'Subject to audit',
    tenure: 'As per lender policy',
    rate: 'Subject to lender policy',
    features: ['Trust / Society deed & affiliation verification list', '3-year audited financial pack preparation', 'Campus infrastructure & equipment estimate review', 'Governing body borrowing resolution guidance', 'Appraisal & sanction solely by institutional lenders'],
  }
];

export default function Loans() {
  useSEO({ title: 'Loans - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: 'Loans, Loan, Avani Finserv, Latur' });

  return (
    <div className="loans-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Official Loan Advisory Overview</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Explore All 8 Loan Advisory Categories</h1>
          <p>Review indicative loan categories, property documentation checklists, and lender coordination support</p>
        </div>
      </section>

      {/* Quick Links to Service Landing Pages */}
      <section className="section">
        <div className="container">
          <h3>Explore Our Services</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {services.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="btn btn-outline">
                {s.h1}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="loans-detail-grid">
            {loans.map((loan) => (
              <div key={loan.id} id={loan.id} className="loan-detail-card glass-card animate-fade-in">
                <div className="ldc-image-wrapper">
                  <img src={loan.image} alt={loan.title} className="ldc-image" />
                </div>
                <div className="ldc-header">
                  <div>
                    <h2 className="ldc-title">{loan.title}</h2>
                    <p className="ldc-tagline">{loan.tagline}</p>
                  </div>
                </div>

                <p className="ldc-desc">{loan.description}</p>

                <div className="ldc-meta">
                  <div className="meta-item"><span className="meta-label">Min Amount</span><span className="meta-val">{loan.minAmount}</span></div>
                  <div className="meta-item"><span className="meta-label">Max Amount</span><span className="meta-val">{loan.maxAmount}</span></div>
                  <div className="meta-item"><span className="meta-label">Tenure</span><span className="meta-val">{loan.tenure}</span></div>
                  <div className="meta-item"><span className="meta-label">Interest Rate</span><span className="meta-val rate-val">{loan.rate}</span></div>
                </div>

                <ul className="ldc-features">
                  {loan.features.map((f, i) => (
                    <li key={i}><CheckCircle size={16} color="var(--primary)" /> {f}</li>
                  ))}
                </ul>

                <div className="ldc-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <Link to="/contact" state={{ loanType: loan.title }} className="btn btn-primary" style={{ flex: '1 1 auto', justifyContent: 'center' }}>
                    Apply for {loan.title} <ArrowRight size={16} />
                  </Link>
                  <a 
                    href={generateWhatsAppDocumentLink(loan.title)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn" 
                    style={{ background: '#25D366', color: '#fff', border: 'none', flex: '1 1 auto', justifyContent: 'center' }}
                    aria-label={`Get ${loan.title} document checklist on WhatsApp`}
                  >
                    <MessageCircle size={16} style={{ marginRight: '6px' }} />
                    📲 Get Document List on WhatsApp
                  </a>
                  <a 
                    href={TEL_HREF} 
                    className="btn btn-outline" 
                    style={{ flex: '1 1 auto', justifyContent: 'center' }}
                    aria-label={`Call ${OFFICIAL_BUSINESS.name} at ${DISPLAY_PHONE} for ${loan.title}`}
                  >
                    <Phone size={16} style={{ marginRight: '6px' }} aria-hidden="true" />
                    Call {DISPLAY_PHONE}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property & Comprehensive Documentation Guide */}
      <section className="section document-guide-section bg-light">
        <div className="container">
          
          {/* 1. PROPERTY DOCUMENTS GUIDE */}
          <div className="text-center" style={{ marginBottom: 40 }}>
            <span className="badge">Documentation Architecture</span>
            <h2 className="section-title">Home Loan & Mortgage Property Documents</h2>
            <p className="section-subtitle">Property documents required for Home Loans and Mortgage Loans / LAP vary across geographies and property types. Final requirement is confirmed after eligibility assessment.</p>
          </div>

          <div className="doc-section-block">
            <h3>A. Property Documents by Location</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>Governing authorities issue location-specific title and clearance documents:</p>
            <div className="doc-grid-3">
              <div className="doc-card">
                <div className="doc-card-icon">🌾</div>
                <h4>Rural Areas (Villages)</h4>
                <p className="doc-gov">Gov: Gram Panchayat / Revenue Dept</p>
                <ul className="doc-list sm">
                  <li><strong>7/12 Extract / Khata:</strong> Official land registry record.</li>
                  <li><strong>Form 8 / 8A Extract:</strong> Assessment register document.</li>
                  <li><strong>NA Permission:</strong> Required where agricultural land converted.</li>
                  <li><strong>Gram Panchayat NOC:</strong> Applicable official clearance.</li>
                  <li><strong>Certified Layout Sketch:</strong> Map certified by revenue authority.</li>
                </ul>
              </div>
              
              <div className="doc-card">
                <div className="doc-card-icon">🏡</div>
                <h4>Semi-Urban Areas (Towns)</h4>
                <p className="doc-gov">Gov: Municipal Councils</p>
                <ul className="doc-list sm">
                  <li><strong>Khata Certificate:</strong> Identifies owner in municipal records.</li>
                  <li><strong>Sanctioned Building Plan:</strong> Approved structural blueprint.</li>
                  <li><strong>Commencement Certificate:</strong> Construction permission (where applicable).</li>
                  <li><strong>Conversion Order:</strong> Valid land conversion documentation.</li>
                </ul>
              </div>

              <div className="doc-card">
                <div className="doc-card-icon">🏙️</div>
                <h4>Urban & Metro Cities</h4>
                <p className="doc-gov">Gov: Municipal Corporations</p>
                <ul className="doc-list sm">
                  <li><strong>Approved Building Blueprint:</strong> Sanctioned municipal layout plan.</li>
                  <li><strong>Occupancy Certificate (OC):</strong> Applicable for ready properties.</li>
                  <li><strong>Builder-Buyer Agreement:</strong> Registered Agreement for Sale.</li>
                  <li><strong>Society Share Certificate & NOC:</strong> Original share certificate & NOC.</li>
                  <li><strong>ULC Clearance:</strong> Applicable where required under land laws.</li>
                </ul>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '12px' }}>
              *Note: Exact requirements may vary by state, local authority, property type, and lender.
            </p>
          </div>

          <div className="doc-section-block" style={{ marginTop: 40 }}>
            <h3>B. Documents by Property Type</h3>
            <div className="doc-grid-3" style={{ marginTop: 20 }}>
              <div className="doc-card alt">
                <h4>🧱 Under-Construction Property</h4>
                <ul className="doc-list sm no-icon">
                  <li>RERA Registration Certificate</li>
                  <li>Allotment Letter</li>
                  <li>Registered Agreement for Sale</li>
                  <li>Sanctioned Building Plan & Layout</li>
                  <li>Commencement Certificate (CC)</li>
                  <li>Builder NOC</li>
                  <li>Tripartite Agreement (where applicable)</li>
                  <li>Demand Letters & Payment Receipts</li>
                </ul>
              </div>
              <div className="doc-card alt">
                <h4>🔄 Resale Property</h4>
                <ul className="doc-list sm no-icon">
                  <li>Original Sale Deed</li>
                  <li>Chain of Title Deeds</li>
                  <li>NOC from Housing Society</li>
                  <li>Share Certificate</li>
                  <li>Occupancy Certificate (OC, where applicable)</li>
                  <li>Encumbrance Certificate (EC, where applicable)</li>
                  <li>Latest Possession Letter</li>
                </ul>
              </div>
              <div className="doc-card alt">
                <h4>📐 Vacant Plot / Land</h4>
                <ul className="doc-list sm no-icon">
                  <li>Original Parent Deed / Allotment Document</li>
                  <li>Mutation Certificate (Khata / 7/12)</li>
                  <li>Non-Agricultural (NA) Conversion (where applicable)</li>
                  <li>Layout Approval Plan</li>
                  <li>Fencing / Demarcation Certificate (where applicable)</li>
                  <li>Land Tax Receipts</li>
                </ul>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
              <a 
                href={generateWhatsAppDocumentLink('Home Loan')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#25D366', color: '#fff' }}
                aria-label="Get Home Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Home Loan Document List on WhatsApp
              </a>
              <a 
                href={generateWhatsAppDocumentLink('Mortgage Loan / LAP')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#0052CC', color: '#fff' }}
                aria-label="Get Mortgage Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Mortgage / LAP Document List on WhatsApp
              </a>
            </div>
          </div>

          {/* 2. EDUCATION LOAN (INDIA) SECTION */}
          <div className="doc-section-block" style={{ marginTop: 60, background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <GraduationCap size={28} color="#0052CC" />
              <h3 style={{ margin: 0, color: '#1E293B' }}>Education Loan — India Document Checklist</h3>
            </div>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Comprehensive checklist for higher education studies in India (Engineering, Medical, MBA, etc.):</p>
            
            <div className="doc-grid-3">
              <div className="doc-card alt">
                <h4>A. Student Documents</h4>
                <ul className="doc-list sm no-icon">
                  <li>Aadhaar Card & PAN Card</li>
                  <li>Passport-size photographs</li>
                  <li>10th & 12th Standard Marksheets</li>
                  <li>Graduation Marksheets (if applicable)</li>
                  <li>Entrance Exam Scorecard (JEE, NEET, CAT, etc.)</li>
                  <li>Admission / Offer Letter from College</li>
                  <li>Official Course Fee Structure</li>
                  <li>Scholarship Letter (if applicable)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>B. Parent / Co-Applicant Documents</h4>
                <ul className="doc-list sm no-icon">
                  <li>Parent / Co-Applicant Aadhaar & PAN Card</li>
                  <li>Passport-size photographs & Address Proof</li>
                  <li>Last 3 Months Salary Slips (for salaried)</li>
                  <li>Last 6 Months Bank Statements</li>
                  <li>Form 16 / Income Tax Returns (last 2 yrs)</li>
                  <li>Business Registration & Financials (for self-employed)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>C. Institution Documents</h4>
                <ul className="doc-list sm no-icon">
                  <li>College Admission / Offer Letter</li>
                  <li>Detailed Fee Structure & Payment Schedule</li>
                  <li>Course Duration & Recognition Proof (UGC/AICTE)</li>
                  <li>Hostel & Miscellaneous Expense Estimate</li>
                  <li>Approved Education Expenses breakdown</li>
                </ul>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #0052CC' }}>
              *Note: Document requirements may vary by lender, applicant profile, course, institution, and loan structure. Final requirements will be confirmed after eligibility assessment.
            </p>

            <div style={{ marginTop: '20px' }}>
              <a 
                href={generateWhatsAppDocumentLink('Education Loan India')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#25D366', color: '#fff' }}
                aria-label="Get India Education Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get India Education Loan Document List on WhatsApp
              </a>
            </div>
          </div>

          {/* 3. EDUCATION LOAN (GLOBAL STUDIES) SECTION */}
          <div className="doc-section-block" style={{ marginTop: 40, background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Globe size={28} color="#0052CC" />
              <h3 style={{ margin: 0, color: '#1E293B' }}>Education Loan — Global Studies (Study Abroad)</h3>
            </div>
            <p style={{ color: '#0052CC', fontWeight: 'bold', marginBottom: '15px' }}>
              Supported Countries: USA | Canada | UK | Australia | Germany & More
            </p>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Comprehensive documentation required for foreign university education loans:</p>

            <div className="doc-grid-3">
              <div className="doc-card alt">
                <h4>A. Student KYC & Academic</h4>
                <ul className="doc-list sm no-icon">
                  <li>Valid Passport (mandatory)</li>
                  <li>Aadhaar Card & PAN Card</li>
                  <li>10th, 12th & Degree Marksheets</li>
                  <li>English Test Score (IELTS / TOEFL / PTE)</li>
                  <li>Standardized Test Scores (GRE / GMAT)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>B. Foreign University Admission</h4>
                <ul className="doc-list sm no-icon">
                  <li>University Offer / Admission Letter</li>
                  <li>I-20 (USA) / CAS (UK) / COE (Australia)</li>
                  <li>Tuition Fee Breakdown & Schedule</li>
                  <li>Estimated Living Expense Document</li>
                  <li>Scholarship / Grant Letter (if applicable)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>C. Co-Applicant & Financials</h4>
                <ul className="doc-list sm no-icon">
                  <li>Parent / Co-applicant KYC (PAN & Aadhaar)</li>
                  <li>Income Proof (Salary Slips / ITR 2 yrs)</li>
                  <li>Parent Bank Statements (6–12 months)</li>
                  <li>Property Documents (if collateral loan)</li>
                  <li>Asset & Property Valuation Report</li>
                </ul>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #0052CC' }}>
              *Disclaimer: Global education loan document requirements vary by country, university, lender, course, collateral structure, and applicant profile. Final documentation will be confirmed after assessment.
            </p>

            <div style={{ marginTop: '20px' }}>
              <a 
                href={generateWhatsAppDocumentLink('Education Loan Global')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#25D366', color: '#fff' }}
                aria-label="Get Global Education Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Global Education Loan Document List on WhatsApp
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
