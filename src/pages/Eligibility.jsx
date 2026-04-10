import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Eligibility.css';

export default function Eligibility() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(24);

  const monthlyRate = rate / 100 / 12;
  const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - principal;

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="eligibility-page">
      <section className="page-header">
        <div className="container">
          <span className="badge">EMI Calculator</span>
          <h1>Check Your Loan Eligibility & EMI</h1>
          <p>Find out your monthly EMI, total interest and see if you qualify — instantly</p>
        </div>
      </section>

      <section className="section">
        <div className="container emi-container">

          <div className="emi-calculator glass-card">
            <h2 className="emi-title">EMI Calculator</h2>

            <div className="slider-group">
              <div className="slider-header">
                <label>Loan Amount</label>
                <span className="slider-val">{fmt(principal)}</span>
              </div>
              <input type="range" min="50000" max="10000000" step="50000" value={principal} onChange={e => setPrincipal(+e.target.value)} className="slider" />
              <div className="slider-range"><span>₹50K</span><span>₹1Cr</span></div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Interest Rate (per annum)</label>
                <span className="slider-val">{rate}%</span>
              </div>
              <input type="range" min="7" max="30" step="0.5" value={rate} onChange={e => setRate(+e.target.value)} className="slider" />
              <div className="slider-range"><span>7%</span><span>30%</span></div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Loan Tenure</label>
                <span className="slider-val">{tenure} months ({(tenure/12).toFixed(1)} yrs)</span>
              </div>
              <input type="range" min="6" max="360" step="6" value={tenure} onChange={e => setTenure(+e.target.value)} className="slider" />
              <div className="slider-range"><span>6M</span><span>30Y</span></div>
            </div>
          </div>

          <div className="emi-results">
            <div className="emi-result-card glass-card">
              <h3>Your Monthly EMI</h3>
              <div className="emi-amount">{fmt(emi)}</div>
              <p className="emi-sub">per month for {tenure} months</p>
            </div>

            <div className="emi-breakdown glass-card">
              <h3>Loan Breakdown</h3>
              <div className="breakdown-item">
                <span>Principal Amount</span>
                <span className="breakdown-val">{fmt(principal)}</span>
              </div>
              <div className="breakdown-item">
                <span>Total Interest</span>
                <span className="breakdown-val interest-val">{fmt(totalInterest)}</span>
              </div>
              <div className="breakdown-divider"></div>
              <div className="breakdown-item total-row">
                <span>Total Repayment</span>
                <span className="breakdown-val total-val">{fmt(totalPayment)}</span>
              </div>
              <div className="emi-bar">
                <div className="emi-bar-principal" style={{ width: `${Math.round((principal/totalPayment)*100)}%` }}></div>
                <div className="emi-bar-interest" style={{ width: `${Math.round((totalInterest/totalPayment)*100)}%` }}></div>
              </div>
              <div className="emi-legend">
                <span><span className="leg-dot principal-dot"></span> Principal {Math.round((principal/totalPayment)*100)}%</span>
                <span><span className="leg-dot interest-dot"></span> Interest {Math.round((totalInterest/totalPayment)*100)}%</span>
              </div>
            </div>

            <div className="emi-qualify glass-card">
              <div className="qualify-icon">✅</div>
              <h3>You Likely Qualify!</h3>
              <p>Based on standard bank criteria, to qualify for this loan your minimum monthly income should be approximately <strong>{fmt(Math.round(emi * 2))}</strong>.</p>
              <Link to="/contact" className="btn btn-secondary" style={{ marginTop: 20, width: '100%' }}>Apply Now → Get Approved</Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
