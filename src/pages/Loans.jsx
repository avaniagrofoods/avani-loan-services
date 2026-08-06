import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import brandLogo from '../assets/avani-brand-logo.png';
import './Loans.css';
import services from '../data/services.json';

// Import Images
import personalImg from '../assets/personal-loan.png';
import businessImg from '../assets/business-loan.png';
import educationImg from '../assets/education-loan.png';
import homeImg from '../assets/home-loan.png';
import mortgageImg from '../assets/mortgage-loan.png';
import doctorImg from '../assets/business-loan.png'; // Reusing business icon if doctor icon not available, or I should use a more specific one if possible, but I'll stick to a placeholder for now and could use generate_image if needed. Actually, let's use business-loan as a placeholder or search for one.

const loans = [
  {
    id: 'school-funding',
    image: educationImg,
    title: 'School Funding & Infrastructure Loan',
    tagline: 'Empowering Educational Institutions in Maharashtra',
    description: 'Comprehensive financial solutions for school trusts, private schools, and educational institutions for infrastructure expansion, Smart Classrooms, buses, and operational working capital.',
    minAmount: '₹5 Lakhs', maxAmount: '₹5 Crores',
    tenure: '12–120 months',
    rate: '9.5% – 14% p.a.',
    features: ['Trust / Society registration accepted', 'Smart Classroom & EdTech equipment funding', 'School bus & transport fleet finance', 'Working capital for staff salary & expansion', 'Attractive interest rates for rural & urban schools'],
  },
  {
    id: 'college-funding',
    image: educationImg,
    title: 'College & Higher Education Funding',
    tagline: 'Supporting Colleges, Universities & Professional Degree Students',
    description: 'Tailored funding for degree colleges, engineering/medical institutes, as well as high-value education loans for undergraduate and postgraduate students.',
    minAmount: '₹2 Lakhs', maxAmount: '₹10 Crores',
    tenure: 'Up to 15 years',
    rate: '8.5% – 13.5% p.a.',
    features: ['Institutional expansion funding', '100% tuition & hostel fee coverage for students', 'Special grants & subvention support', 'No collateral up to ₹7.5 Lakhs for students', 'Fast clearance for NAAC/UGC recognized colleges'],
  },
  {
    id: 'salary',
    image: personalImg,
    title: 'Salary / Personal Loan',
    tagline: 'Quick cash for salaried employees',
    description: 'Unsecured personal loan for government and private sector employees. No collateral required.',
    minAmount: '₹50,000', maxAmount: '₹50 Lakhs',
    tenure: '12–60 months',
    rate: '10.5% – 18% p.a.',
    features: ['No collateral needed', 'Instant approval for govt employees', 'Salary slip required', 'Minimum salary ₹15,000/month', 'Repayment via auto-EMI'],
  },
  {
    id: 'business',
    image: businessImg,
    title: 'Business Loan',
    tagline: 'Fuel your business growth',
    description: 'Unsecured business loans for MSMEs, proprietors, and small businesses in Maharashtra.',
    minAmount: '₹1 Lakh', maxAmount: '₹2 Crores',
    tenure: '12–84 months',
    rate: '12% – 24% p.a.',
    features: ['No collateral up to ₹50L', 'GST / ITR required', 'Bank statement last 12 months', 'Approval within 5 days', 'Balance transfer facility'],
  },
  {
    id: 'education-india',
    image: educationImg,
    title: 'Education Loan (India)',
    tagline: 'Invest in your future in India',
    description: 'Education loan for MBBS, Engineering, MBA at top Indian institutions with easy repayment.',
    minAmount: '₹1 Lakh', maxAmount: '₹75 Lakhs',
    tenure: 'Up to 15 years',
    rate: '8.15% – 12% p.a.',
    features: ['Covers tuition + hostel + books', 'Moratorium period available', 'Tax benefit u/s 80E', 'Co-applicant required', 'No margin for loans up to ₹4L'],
  },
  {
    id: 'education-global',
    image: educationImg,
    title: 'Education Loan (Study Abroad)',
    tagline: 'Study globally, repay easily',
    description: 'Fund your education at top universities in USA, UK, Canada, Australia, Germany, and more.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1.5 Crores',
    tenure: 'Up to 15 years',
    rate: '9% – 14% p.a.',
    features: ['GRE/IELTS not required for approval', 'Visa letter assistance', 'Covers living expenses abroad', 'Tax benefit u/s 80E', 'Collateral required above ₹40L'],
  },
  {
    id: 'home',
    image: homeImg,
    title: 'Home Loan',
    tagline: 'Own your dream home',
    description: 'Secured home loans for purchase, construction, or renovation of residential property.',
    minAmount: '₹5 Lakhs', maxAmount: '₹5 Crores',
    tenure: 'Up to 30 years',
    rate: '8.5% – 12% p.a.',
    features: ['Up to 90% of property value', 'PMAY subsidy available', 'Joint loan with spouse', 'Balance transfer benefits', 'Flexible repayment options'],
  },
  {
    id: 'mortgage',
    image: mortgageImg,
    title: 'Mortgage / LAP',
    tagline: 'Unlock your property value',
    description: 'Loan Against Property (LAP) for business or personal needs by pledging residential/commercial property.',
    minAmount: '₹5 Lakhs', maxAmount: '₹10 Crores',
    tenure: 'Up to 20 years',
    rate: '9% – 14% p.a.',
    features: ['Up to 70% of property value', 'Both residential & commercial', 'Minimal documentation', 'Income from all sources considered', 'Top-up loans available'],
  },
  {
    id: 'chartered-accountant',
    image: businessImg,
    title: 'Chartered Accountant Loan',
    tagline: 'Exclusively for CAs',
    description: 'Specialized professional loan for Chartered Accountants to expand their practice or meet personal needs.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1 Crore',
    tenure: '12–60 months',
    rate: '10.25% – 14.5% p.a.',
    features: [
      'Valid COP required',
      'ICAI Membership active',
      'No collateral required',
      'Special rates for CAs',
      'Quick approvals'
    ],
  },
  {
    id: 'doctor-professional',
    image: doctorImg,
    title: 'Doctor / Professional Loan',
    tagline: 'For Medical & Certified Professionals',
    description: 'Specialized loan for doctors, architects, and certified professionals to expand their practice, clinics, or personal needs.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1 Crore',
    tenure: '12–84 months',
    rate: '10.25% – 14.5% p.a.',
    features: [
      'Degree / Registration required',
      'No collateral for equipment',
      'Special rates for professionals',
      'Flexible repayment options',
      'Minimum practice experience'
    ],
  },
  {
    id: 'car',
    image: mortgageImg,
    title: 'Car Loan',
    tagline: 'Drive your success',
    description: 'Finance your new or used car with flexible repayment options and competitive interest rates.',
    minAmount: '₹1 Lakh', maxAmount: '₹50 Lakhs',
    tenure: '12–84 months',
    rate: '7.5% – 12% p.a.',
    features: ['Up to 100% on-road funding', 'Used car loans available', 'Quick processing', 'Flexible EMIs', 'Minimal documentation'],
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
              <span className="badge">All Loan Products</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Find the Right Loan for You</h1>
          <p>Explore all loan products with transparent rates, eligibility, and terms</p>
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

                <div className="ldc-actions">
                  <Link to="/contact" state={{ loanType: loan.title }} className="btn btn-primary">
                    Apply for {loan.title} <ArrowRight size={16} />
                  </Link>
                  <Link to="/documents" className="btn btn-outline">Documents Needed</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Documents Guide */}
      <section className="section document-guide-section bg-light">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <span className="badge">Documentation Guide</span>
            <h2 className="section-title">Mandatory Property Documents</h2>
            <p className="section-subtitle">Property documents required for Home Loans and Mortgage Loans (LAP) vary across geographies in India. Lenders require location-specific approvals from local governing bodies.</p>
          </div>

          <div className="doc-section-block">
            <h3>1. Core Property Documents (Common to All Locations)</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>These baseline documents are mandatory across all rural, urban, and metro regions:</p>
            <ul className="doc-list">
              <li><CheckCircle size={18} color="var(--primary)" /> <strong>Primary Title Deed:</strong> Original Sale Deed, Gift Deed, or Allotment Letter establishing current ownership.</li>
              <li><CheckCircle size={18} color="var(--primary)" /> <strong>Chain of Deeds:</strong> Historical link documents tracking property ownership for the past 13 to 30 years.</li>
              <li><CheckCircle size={18} color="var(--primary)" /> <strong>Encumbrance Certificate (EC):</strong> Certificate for the past 12–30 years proving the property is free of legal disputes or existing liens.</li>
              <li><CheckCircle size={18} color="var(--primary)" /> <strong>Tax Paid Receipts:</strong> Latest property, municipal, or land tax receipts showing no outstanding dues.</li>
              <li><CheckCircle size={18} color="var(--primary)" /> <strong>Detailed Cost Estimate:</strong> Required specifically for self-construction or home renovation loans, verified by a certified architect.</li>
            </ul>
          </div>

          <div className="doc-grid-3">
            <div className="doc-card">
              <div className="doc-card-icon">🌾</div>
              <h4>Rural Areas (Villages)</h4>
              <p className="doc-gov">Gov: Gram Panchayat</p>
              <ul className="doc-list sm">
                <li><strong>7/12 Extract / Khata:</strong> Official land registry record.</li>
                <li><strong>Form 8 / 8A Extract:</strong> Assessment register document displaying tax.</li>
                <li><strong>NA Permission:</strong> Mandatory order if agricultural land was converted.</li>
                <li><strong>Gram Panchayat NOC:</strong> Official clearance from the village head.</li>
                <li><strong>Certified Layout Sketch:</strong> Map drawn by local revenue authorities.</li>
              </ul>
            </div>
            
            <div className="doc-card">
              <div className="doc-card-icon">🏡</div>
              <h4>Semi-Urban Areas (Towns)</h4>
              <p className="doc-gov">Gov: Municipal Councils</p>
              <ul className="doc-list sm">
                <li><strong>Khata Certificate:</strong> Identifies owner in municipal records.</li>
                <li><strong>Sanctioned Building Plan:</strong> Structural blueprint approved by council.</li>
                <li><strong>Commencement Certificate:</strong> Document permitting construction past plinth.</li>
                <li><strong>Conversion Order:</strong> Valid land conversion documentation.</li>
              </ul>
            </div>

            <div className="doc-card">
              <div className="doc-card-icon">🏙️</div>
              <h4>Urban & Metro Cities</h4>
              <p className="doc-gov">Gov: Municipal Corporations</p>
              <ul className="doc-list sm">
                <li><strong>Approved Building Blueprint:</strong> Sanctioned layout plan from BMC/MCD etc.</li>
                <li><strong>Occupancy Certificate (OC):</strong> Mandatory for ready-to-move properties.</li>
                <li><strong>Builder-Buyer Agreement:</strong> Registered Agreement for Sale.</li>
                <li><strong>Society Share Certificate & NOC:</strong> Original share certificate and official NOC.</li>
                <li><strong>ULC Clearance:</strong> NOC under the Urban Land Ceiling Act.</li>
              </ul>
            </div>
          </div>

          <div className="doc-section-block" style={{ marginTop: 60 }}>
            <h3>2. Documents by Property Type</h3>
            <div className="doc-grid-3" style={{ marginTop: 24 }}>
              <div className="doc-card alt">
                <h4>🧱 Under-Construction</h4>
                <ul className="doc-list sm no-icon">
                  <li>RERA Registration Certificate</li>
                  <li>Allotment Letter</li>
                  <li>Registered Agreement for Sale</li>
                  <li>Sanctioned Building Plan & Layout</li>
                  <li>Commencement Certificate (CC)</li>
                  <li>NOC from Builder</li>
                  <li>Tripartite Agreement</li>
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
                  <li>Occupancy Certificate (OC)</li>
                  <li>Encumbrance Certificate (EC)</li>
                  <li>Latest Possession Letter</li>
                </ul>
              </div>
              <div className="doc-card alt">
                <h4>📐 Vacant Plot / Land</h4>
                <ul className="doc-list sm no-icon">
                  <li>Original Parent Deed / Allotment</li>
                  <li>Mutation Certificate (Khata/7/12)</li>
                  <li>Non-Agricultural (NA) Conversion</li>
                  <li>Layout Approval Plan</li>
                  <li>Fencing/Demarcation Certificate</li>
                  <li>Land Tax Receipts</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="doc-section-block doc-kyc-card">
            <h3>👤 Non-Property Documents (Borrower KYC & Income)</h3>
            <p>Lenders require these identity and income verifications irrespective of property location:</p>
            <ul className="doc-list white">
              <li><strong>Identity & Address:</strong> Valid PAN Card (mandatory) alongside Aadhaar, Passport, or Voter ID.</li>
              <li><strong>For Salaried Applicants:</strong> Past 3 months' salary slips, Form 16 (last 2 years), and 6 months' bank statements.</li>
              <li><strong>For Self-Employed Applicants:</strong> Past 2–3 years' Audited P&L statements, Balance Sheet, and ITR files with income calculations.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
