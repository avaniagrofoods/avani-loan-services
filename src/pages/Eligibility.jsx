import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, CheckCircle2, AlertCircle, ArrowRight, MousePointer2, UserCheck, ShieldCheck, Clock, Calculator } from 'lucide-react';
import './Eligibility.css';

export default function Eligibility() {
  const [loanType, setLoanType] = useState('Personal');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [existingEmi, setExistingEmi] = useState('');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('60');
  const [age, setAge] = useState('30');
  
  const [itrIncome1, setItrIncome1] = useState('');
  const [itrIncome2, setItrIncome2] = useState('');
  const [ackIncome, setAckIncome] = useState('');
  const [propertyType, setPropertyType] = useState('Urban');

  const [maxLoanAmount, setMaxLoanAmount] = useState(0);
  const [availableEmi, setAvailableEmi] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const income = parseFloat(monthlyIncome) || 0;
    const emi = parseFloat(existingEmi) || 0;
    const r = parseFloat(rate) || 10.5;
    const n = parseFloat(tenure) || 60;

    // Fixed Obligation to Income Ratio (FOIR)
    const foir = 0.50; // 50% as per standard logic
    const totalEmiCapacity = income * foir;
    const newEmiAffordability = totalEmiCapacity - emi;
    
    setAvailableEmi(newEmiAffordability);

    if (newEmiAffordability <= 0) {
      setMaxLoanAmount(0);
      setIsEligible(false);
    } else {
      const monthlyRate = r / 100 / 12;
      const amount = newEmiAffordability * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n));
      setMaxLoanAmount(Math.round(amount));
      setIsEligible(true);
    }
    
    setShowResult(true);
    // Optional: Scroll to results
    setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fmt = n => '₹' + Math.max(0, n).toLocaleString('en-IN');

  return (
    <div className="eligibility-page">
      <section className="page-header">
        <div className="container">
          <span className="badge">Calculators</span>
          <h1>Loan Eligibility Calculator</h1>
          <p>Lenders determine your loan eligibility using the Fixed Obligation to Income Ratio (FOIR). Check yours instantly.</p>
        </div>
      </section>

      <section className="section">
        <div className="container emi-container">

          <div className="emi-calculator glass-card">
            <div className="calc-tabs">
              <button className={loanType === 'Personal' ? 'active' : ''} onClick={() => setLoanType('Personal')}>Personal / Salary</button>
              <button className={loanType === 'Business' ? 'active' : ''} onClick={() => setLoanType('Business')}>Business Loan</button>
              <button className={loanType === 'Home' ? 'active' : ''} onClick={() => setLoanType('Home')}>Home / Mortgage</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="manual-input-grid">
                <div className="slider-group">
                  <label className="input-label">Monthly Net Income (Net Salary)</label>
                  <input 
                    type="number" 
                    value={monthlyIncome} 
                    onChange={e => setMonthlyIncome(e.target.value)} 
                    className="form-input manual-box" 
                    placeholder="e.g. 50000" 
                    required 
                  />
                  <p className="input-hint">Enter your net take-home salary.</p>
                </div>

                <div className="slider-group">
                  <label className="input-label">Existing Monthly EMIs</label>
                  <input 
                    type="number" 
                    value={existingEmi} 
                    onChange={e => setExistingEmi(e.target.value)} 
                    className="form-input manual-box" 
                    placeholder="e.g. 5000" 
                    required 
                  />
                  <p className="input-hint">Include current liabilities (Home, Car, Personal loans, Credit cards).</p>
                </div>
              </div>

              <div className="calc-row-grid">
                <div className="slider-group">
                  <label className="input-label">Expected Interest Rate (% p.a.)</label>
                  <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className="form-input" placeholder="e.g. 10.5" />
                </div>
                <div className="slider-group">
                  <label className="input-label">Desired Tenure (Months)</label>
                  <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} className="form-input" placeholder="e.g. 60" />
                </div>
              </div>

              <div className="calc-row-grid">
                 <div className="slider-group">
                    <label className="input-label">Age (Years)</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} className="form-input" placeholder="21-60" />
                 </div>
                 {loanType === 'Business' && (
                   <>
                     <div className="slider-group">
                        <label className="input-label">ITR Net Income (Year 1)</label>
                        <input type="number" value={itrIncome1} onChange={e => setItrIncome1(e.target.value)} className="form-input" placeholder="From Ack page" />
                     </div>
                     <div className="slider-group">
                        <label className="input-label">ITR Net Income (Year 2)</label>
                        <input type="number" value={itrIncome2} onChange={e => setItrIncome2(e.target.value)} className="form-input" placeholder="Previous Year" />
                     </div>
                   </>
                 )}
                 {loanType === 'Home' && (
                   <>
                     <div className="slider-group">
                        <label className="input-label">Ack. Net Income</label>
                        <input type="number" value={ackIncome} onChange={e => setAckIncome(e.target.value)} className="form-input" placeholder="From Ack page" />
                     </div>
                     <div className="slider-group">
                        <label className="input-label">Property Detail</label>
                        <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="form-input">
                           <option value="Urban">Urban (City Area)</option>
                           <option value="Rural">Rural (Gavthan)</option>
                           <option value="8A">8A Extract (Property)</option>
                           <option value="7/12">7/12 Extract (Satbara)</option>
                        </select>
                     </div>
                   </>
                 )}
              </div>

              <button type="submit" className="btn btn-primary submit-calc">
                Calculate Maximum Eligible Amount <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div id="results-section" className="emi-results">
            {showResult ? (
              <>
                <div className={`emi-result-card glass-card ${!isEligible ? 'ineligible' : ''} animate-slide-up`}>
                  <h3>Maximum Loan Eligibility</h3>
                  <div className="emi-amount">{fmt(maxLoanAmount)}</div>
                  <p className="emi-sub">Maximum Installment (New EMI): {fmt(availableEmi)}/month</p>
                </div>

                <div className="emi-qualify glass-card animate-slide-up">
                  <div className="qualify-icon">{isEligible ? <CheckCircle2 color="#16a34a" size={40} /> : <AlertCircle color="#eab308" size={40} />}</div>
                  <h3>{isEligible ? "Eligibility Result: Low Risk" : "Eligibility Result: Action Required"}</h3>
                  <p>
                    {isEligible 
                      ? `Based on a 50% FOIR, you qualify for up to ${fmt(maxLoanAmount)}! Lowering your existing EMIs can further increase this amount.`
                      : "Your existing obligations are high compared to your income. We recommend consolidating your debts or adding a co-applicant."}
                  </p>
                  <Link to="/contact" className="btn btn-secondary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                    {isEligible ? "Apply Now with These Details" : "Consult our Expert for Solution"}
                  </Link>
                </div>
              </>
            ) : (
              <div className="waiting-card glass-card">
                 <Calculator size={48} className="wait-icon" />
                 <h3>Ready to Calculate?</h3>
                 <p>Input your monthly income and liabilities to see your maximum borrowing capacity.</p>
              </div>
            )}
            
            <div className="eligibility-knowledge">
              <h4>Key Factors Impacting Eligibility</h4>
              <div className="factor-list">
                <div className="factor-item">
                  <UserCheck size={20} className="factor-icon" />
                  <div>
                    <strong>Income & Expenses</strong>
                    <p>Primary drivers are net monthly income and existing liabilities (FOIR).</p>
                  </div>
                </div>
                <div className="factor-item">
                  <ShieldCheck size={20} className="factor-icon" />
                  <div>
                    <strong>Credit Score</strong>
                    <p>A score of 710 or higher is typically required for favorable terms.</p>
                  </div>
                </div>
                <div className="factor-item">
                   <Clock size={20} className="factor-icon" />
                  <div>
                    <strong>Age & Tenure</strong>
                    <p>Age affects maximum tenure; most lenders cap at 30 years.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="educational-content">
            <div className="edu-grid">
              <div className="edu-block">
                <h2>How to Use This Eligibility Calculator?</h2>
                <ol className="edu-list">
                  <li><strong>Input Monthly net Income:</strong> Enter your net take-home salary.</li>
                  <li><strong>Input Existing EMIs:</strong> Include all current liabilities.</li>
                  <li><strong>Enter Loan Details:</strong> Input expected interest rate, tenure, and age.</li>
                  <li><strong>Analyze Result:</strong> The tool calculates the maximum loan amount, with lower existing EMIs resulting in higher eligibility.</li>
                </ol>
              </div>
              <div className="edu-block">
                <h2>Fixed Obligation to Income Ratio (FOIR)</h2>
                <p>Lenders usually allow 40–60% of your net income for all loan repayments. This ensures that your total monthly debt payments, including the new loan, do not exceed your repayment capacity.</p>
                <div className="logic-steps">
                   <div className="step">
                     <span className="step-num">1</span>
                     <p><strong>Max EMI Capacity:</strong> 50% of your gross monthly income.</p>
                   </div>
                   <div className="step">
                     <span className="step-num">2</span>
                     <p><strong>Deduct EMIs:</strong> Subtract ongoing obligations (Car, Personal, etc.).</p>
                   </div>
                   <div className="step">
                     <span className="step-num">3</span>
                     <p><strong>New Eligible EMI:</strong> The remaining balance you can afford.</p>
                   </div>
                   <div className="step">
                     <span className="step-num">4</span>
                     <p><strong>Final Amount:</strong> Loan size based on available EMI, rate and tenure.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section lenders-section">
        <div className="container">
           <div className="lenders-header">
              <h2>Our Banking Partners</h2>
              <p>We work with India's top lenders to get you the best eligibility and rates</p>
           </div>
           <div className="bank-logos">
              <div className="bank-logo">IDFC FIRST Bank</div>
              <div className="bank-logo">Bajaj Finserv</div>
              <div className="bank-logo">HDFC Bank</div>
              <div className="bank-logo">LIC Housing Finance</div>
              <div className="bank-logo">Piramal Finance</div>
           </div>
        </div>
      </section>
    </div>
  );
}
