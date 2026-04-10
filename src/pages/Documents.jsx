import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Documents.css';

const docs = [
  {
    title: 'Salary / Personal Loan',
    icon: '💼',
    items: [
      { category: 'Identity Proof (Any 1)', list: ['Aadhaar Card', 'PAN Card', 'Passport', "Voter's ID"] },
      { category: 'Address Proof (Any 1)', list: ['Aadhaar Card', 'Utility Bill (last 3 months)', 'Driving License'] },
      { category: 'Income Documents', list: ['Last 3 months salary slips', 'Last 6 months bank statements', 'Form 16 (last 2 years)'] },
      { category: 'Employment Proof', list: ['Employee ID Card', 'Appointment Letter', 'Offer Letter (for new joinees)'] },
    ]
  },
  {
    title: 'Business Loan',
    icon: '🏭',
    items: [
      { category: 'Identity & Address Proof', list: ['PAN Card (Individual + Business)', 'Aadhaar Card', 'GST Registration Certificate'] },
      { category: 'Business Documents', list: ['Business Registration / Udyam Certificate', 'Shop & Establishment Certificate', 'Partnership Deed / MOA (if applicable)'] },
      { category: 'Financial Documents', list: ['Last 2 years ITR with CA stamp', 'Last 12 months bank statements', 'Last 2 years audited balance sheet'] },
    ]
  },
  {
    title: 'Education Loan (India)',
    icon: '🎓',
    items: [
      { category: 'Student Documents', list: ['Mark sheets (10th, 12th, Graduation)', 'Admission letter from college', 'Fee structure from institution', 'Student Aadhaar & PAN Card'] },
      { category: 'Co-applicant Documents', list: ['PAN & Aadhaar of parent/guardian', 'Income proof of co-applicant', 'Bank statements (6 months)'] },
      { category: 'Additional', list: ['GRE/GATE score (if applicable)', 'Scholarship proof (if any)', 'Entrance exam result'] },
    ]
  },
  {
    title: 'Education Loan (Study Abroad)',
    icon: '✈️',
    items: [
      { category: 'Student Documents', list: ['Offer/admission letter from foreign university', 'Valid passport', 'Test scores (IELTS, TOEFL, GRE, GMAT)', 'Visa (if already obtained)'] },
      { category: 'Financial Documents', list: ['Co-applicant income proof', 'ITR (2 years)', 'Bank statements (1 year)', 'Property documents (if collateral loan)'] },
    ]
  },
  {
    title: 'Home Loan',
    icon: '🏠',
    items: [
      { category: 'Personal Documents', list: ['PAN Card', 'Aadhaar Card', 'Photograph'] },
      { category: 'Income Documents', list: ['Salary slips / ITR (2 years)', 'Form 16 / CA certified accounts', 'Bank statements (6 months)'] },
      { category: 'Property Documents', list: ['Sale agreement / allotment letter', 'Property title deed', 'NOC from builder/society', 'Approved building plan', 'Property tax receipts'] },
    ]
  },
  {
    title: 'Mortgage / LAP',
    icon: '🏦',
    items: [
      { category: 'Personal Documents', list: ['PAN Card', 'Aadhaar Card', 'Passport size photo'] },
      { category: 'Income Documents', list: ['Last 3 years ITR', 'Last 6 months bank statements', 'Business financials (if self-employed)'] },
      { category: 'Property Documents', list: ['Original title deed', 'Encumbrance certificate', 'Property tax receipts', 'NOC from co-owners if applicable', 'Valuation report'] },
    ]
  },
];

function DocAccordion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="doc-card glass-card">
      <button className="doc-header" onClick={() => setOpen(!open)}>
        <span className="doc-icon">{item.icon}</span>
        <span className="doc-title">{item.title}</span>
        {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
      </button>
      {open && (
        <div className="doc-body animate-fade-in">
          {item.items.map((cat, i) => (
            <div key={i} className="doc-category">
              <h4>{cat.category}</h4>
              <ul>
                {cat.list.map((d, j) => <li key={j}>✅ {d}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Documents() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="badge">Documentation</span>
          <h1>Documents Required for Each Loan</h1>
          <p>Click on any loan type to see the exact documents you need to prepare</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="docs-tip glass-card">
            💡 <strong>Pro Tip:</strong> Start collecting these documents before applying. Our advisors will review your documents FREE and confirm your eligibility.
            <a href="https://wa.me/917249108474" target="_blank" rel="noopener noreferrer" className="tip-link"> WhatsApp your docs →</a>
          </div>
          <div className="docs-list">
            {docs.map((d, i) => <DocAccordion key={i} item={d} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
