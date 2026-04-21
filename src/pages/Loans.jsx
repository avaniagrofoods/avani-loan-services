import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import './Loans.css';

// Import Images
import personalImg from '../assets/personal-loan.png';
import businessImg from '../assets/business-loan.png';
import educationImg from '../assets/education-loan.png';
import homeImg from '../assets/home-loan.png';
import mortgageImg from '../assets/mortgage-loan.png';
import doctorImg from '../assets/business-loan.png'; // Reusing business icon if doctor icon not available, or I should use a more specific one if possible, but I'll stick to a placeholder for now and could use generate_image if needed. Actually, let's use business-loan as a placeholder or search for one.

const loans = [
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
    id: 'doctor',
    image: doctorImg,
    title: 'Doctor Loan',
    tagline: 'Exclusively for Medical Professionals',
    description: 'Specialized loan for doctors, dentists, and veterinary professionals to expand their practice, clinics, or personal needs.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1 Crore',
    tenure: '12–84 months',
    rate: '10.25% – 14.5% p.a.',
    features: [
      'Degree Certificate required',
      'Registration Certificate (Old & New)',
      'PG Certificate required',
      'No collateral for clinical equipment',
      'Special rates for medical practitioners'
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
  return (
    <div className="loans-page">
      <section className="page-header">
        <div className="container">
          <span className="badge">All Loan Products</span>
          <h1>Find the Right Loan for You</h1>
          <p>Explore all loan products with transparent rates, eligibility, and terms</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="loans-detail-grid">
            {loans.map((loan) => (
              <div key={loan.id} className="loan-detail-card glass-card animate-fade-in">
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
    </div>
  );
}
