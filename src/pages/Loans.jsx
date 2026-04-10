import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import './Loans.css';

const loans = [
  {
    id: 'salary',
    icon: '💼',
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
    icon: '🏭',
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
    icon: '🎓',
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
    icon: '✈️',
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
    icon: '🏠',
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
    icon: '🏦',
    title: 'Mortgage / LAP',
    tagline: 'Unlock your property value',
    description: 'Loan Against Property (LAP) for business or personal needs by pledging residential/commercial property.',
    minAmount: '₹5 Lakhs', maxAmount: '₹10 Crores',
    tenure: 'Up to 20 years',
    rate: '9% – 14% p.a.',
    features: ['Up to 70% of property value', 'Both residential & commercial', 'Minimal documentation', 'Income from all sources considered', 'Top-up loans available'],
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
                <div className="ldc-header">
                  <span className="ldc-icon">{loan.icon}</span>
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
