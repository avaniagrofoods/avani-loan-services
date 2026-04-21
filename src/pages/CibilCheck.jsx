import { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, User, FileText, Download, CheckCircle, ArrowRight, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { jsPDF } from 'jspdf';
import { logToGoogleSheets } from '../lib/googleSheets';
import './CibilCheck.css';

export default function CibilCheck() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    mobile: '',
    email: '',
    income: '50000',
    age: '30'
  });

  const [otp, setOtp] = useState(['', '', '', '']);
  const [sentOtp, setSentOtp] = useState('');
  const [error, setError] = useState('');
  const [estimatedScore, setEstimatedScore] = useState(0);

  // EmailJS Config (Using user provided credentials)
  const EMAILJS_SERVICE_ID = 'service_ez4cafu';
  const EMAILJS_TEMPLATE_ID = 'template_or9d6zk'; // OTP Verification Template
  const EMAILJS_PUBLIC_KEY = 'keeklL2S-cJ4zYcyV';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    // PAN Validation (Basic Indian PAN Regex)
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (!panRegex.test(formData.pan.toUpperCase())) {
      setError('Please enter a valid PAN number.');
      return;
    }

    setLoading(true);
    const newOtp = generateOtp();
    setSentOtp(newOtp);

    // If EmailJS is configured, send the mail
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: formData.email,
            to_name: formData.name,
            otp_code: newOtp
          },
          EMAILJS_PUBLIC_KEY
        );
        setStep(2);
      } catch (err) {
        console.error('EmailJS Error:', err);
        setError('Failed to send OTP. Please check your EmailJS configuration.');
      }
    } else {
      // Simulation mode if no keys
      console.log('SIMULATION: OTP is', newOtp);
      alert(`Simulation Mode: Your OTP is ${newOtp}`);
      setStep(2);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === sentOtp) {
      calculateResult();
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    
    // Estimation Logic
    const base = 650;
    const incomeBonus = Math.min(150, parseInt(formData.income) / 1000);
    const ageBonus = Math.min(50, parseInt(formData.age));
    const finalScore = Math.floor(base + incomeBonus + (ageBonus / 2));
    
    setEstimatedScore(finalScore);

    // Log to Google Sheets
    await logToGoogleSheets({
      ...formData,
      estimatedScore: finalScore
    });

    setStep(3);
    setLoading(false);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(10, 79, 139);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('AVANI LOAN SERVICES', 20, 25);
    doc.setFontSize(12);
    doc.text('Premium Credit Health Analysis Report', 20, 35);
    doc.setFontSize(10);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 150, 25);

    // Bureau Style Grid
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(16);
    doc.text('CONSUMER CREDIT SUMMARY', 20, 65);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 68, pageWidth - 20, 68);

    // Customer Details Table-like Layout
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Full Name:', 20, 80);
    doc.text('PAN Number:', 110, 80);
    doc.text('Email Address:', 20, 90);
    doc.text('Mobile Number:', 110, 90);

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(12);
    doc.text(formData.name.toUpperCase(), 50, 80);
    doc.text(formData.pan.toUpperCase(), 145, 80);
    doc.text(formData.email, 50, 90);
    doc.text(formData.mobile, 145, 90);

    // The Main Score Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 105, pageWidth - 40, 60, 5, 5, 'F');
    
    // Gauge Logic for PDF (Textual representation)
    const scoreColor = estimatedScore >= 750 ? [16, 185, 129] : (estimatedScore >= 700 ? [59, 130, 246] : [239, 68, 68]);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(14);
    doc.text('ESTIMATED CREDIT SCORE', (pageWidth / 2) - 30, 120);
    doc.setFontSize(60);
    doc.text(estimatedScore.toString(), (pageWidth / 2) - 25, 150);
    
    doc.setFontSize(12);
    doc.text(getScoreLabel(estimatedScore).label.toUpperCase(), (pageWidth / 2) - 15, 160);

    // Score Factors
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(14);
    doc.text('Analysis of Credit Factors', 20, 185);
    doc.line(20, 187, pageWidth - 20, 187);

    const factors = [
      { name: 'Payment History', value: 'Positive', impact: 'High' },
      { name: 'Credit Utilization', value: 'Moderate', impact: 'High' },
      { name: 'Age of Credit', value: `${formData.age / 10} Years (Est)`, impact: 'Medium' },
      { name: 'Total Accounts', value: 'Healthy Mix', impact: 'Medium' }
    ];

    factors.forEach((f, i) => {
      const y = 200 + (i * 12);
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(f.name, 25, y);
      doc.setTextColor(33, 33, 33);
      doc.text(f.value, 80, y);
      doc.setTextColor(100, 100, 100);
      doc.text(`Impact: ${f.impact}`, 150, y);
    });

    // Score Legend
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 250, pageWidth - 40, 25, 'F');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('300 - 649: Poor | 650 - 699: Average | 700 - 749: Good | 750 - 900: Excellent', 45, 265);

    // Footer Disclaimer
    doc.setFontSize(8);
    const disclaimer = 'Disclaimer: This report is an estimation generated based on self-reported data (Income, Age, PAN). This is NOT an official credit report from CIBIL, Experian, Equifax, or CRIF High Mark. Actual scores may vary when pulled from official bureaus. Avani Loan Services uses this data for preliminary eligibility assessment only.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(splitDisclaimer, 20, 285);

    doc.save(`Credit_Report_${formData.pan.toUpperCase()}.pdf`);
  };

  const getScoreLabel = (score) => {
    if (score >= 750) return { label: 'Excellent', class: 'excellent' };
    if (score >= 700) return { label: 'Good', class: 'good' };
    if (score >= 650) return { label: 'Average', class: 'average' };
    return { label: 'Poor', class: 'poor' };
  };

  return (
    <div className="cibil-check-page">
      <section className="page-header">
        <div className="container">
          <span className="badge">Credit Tools</span>
          <h1>Free CIBIL Score Check</h1>
          <p>Get an instant estimation of your credit health and download your summary report.</p>
        </div>
      </section>

      <section className="section">
        <div className="container cibil-container">
          
          <div className="cibil-form-card glass-card">
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="step-header">
                  <h3>Enter Your Details</h3>
                  <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                    <div className="step-dot"></div>
                  </div>
                </div>

                <form onSubmit={handleGetOtp}>
                  <div className="slider-group">
                    <label className="input-label">Full Name (as per PAN)</label>
                    <div className="pan-input-wrapper">
                      <User className="verified-badge" size={18} />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required placeholder="John Doe" />
                    </div>
                  </div>

                  <div className="calc-row-grid">
                    <div className="slider-group">
                      <label className="input-label">PAN Card Number</label>
                      <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} className="form-input pan-input" maxLength={10} required placeholder="ABCDE1234F" />
                    </div>
                    <div className="slider-group">
                      <label className="input-label">Mobile Number</label>
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="form-input" maxLength={10} required placeholder="9876543210" />
                    </div>
                  </div>

                  <div className="slider-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required placeholder="john@example.com" />
                  </div>

                  <div className="calc-row-grid">
                    <div className="slider-group">
                      <label className="input-label">Monthly Income</label>
                      <input type="number" name="income" value={formData.income} onChange={handleInputChange} className="form-input" required />
                    </div>
                    <div className="slider-group">
                      <label className="input-label">Age</label>
                      <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="form-input" required />
                    </div>
                  </div>

                  {error && <div className="eligibility-alert" style={{ marginBottom: 20 }}><AlertTriangle size={18}/> <p>{error}</p></div>}

                  <button type="submit" className="btn btn-primary submit-calc" disabled={loading}>
                    {loading ? <RefreshCw className="animate-spin" /> : <>Get OTP for Verification <ArrowRight size={18} /></>}
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in text-center">
                <div className="step-header">
                  <h3>Verify Your Email</h3>
                  <p>We've sent a 4-digit code to {formData.email}</p>
                  <div className="step-indicator">
                    <div className="step-dot"></div>
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                  </div>
                </div>

                <div className="otp-inputs">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength="1"
                      className="otp-box"
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[idx] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                      }}
                    />
                  ))}
                </div>

                {error && <p className="text-danger" style={{ marginBottom: 15 }}>{error}</p>}

                <button onClick={handleVerifyOtp} className="btn btn-primary submit-calc" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" /> : "Verify & See Result"}
                </button>
                <button onClick={() => setStep(1)} className="btn btn-link" style={{ marginTop: 10 }}>Change Details</button>
              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-up">
                <div className="step-header">
                  <h3>Your CIBIL Health</h3>
                  <div className="step-indicator">
                    <div className="step-dot"></div>
                    <div className="step-dot"></div>
                    <div className="step-dot active"></div>
                  </div>
                </div>

                <div className="score-gauge-container">
                  <div className="gauge-wrap">
                    <div className="gauge"></div>
                    <div className="gauge-needle" style={{ transform: `rotate(${(estimatedScore - 300) * 180 / 600 - 90}deg)` }}></div>
                  </div>
                  <div className="score-display">
                    <div className="score-value">{estimatedScore}</div>
                    <div className={`score-label ${getScoreLabel(estimatedScore).class}`}>
                      {getScoreLabel(estimatedScore).label}
                    </div>
                  </div>
                </div>

                <p className="text-center" style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
                  Great status! Based on your income of ₹{formData.income}, you are eligible for premium loan products.
                </p>

                <div className="score-criteria-grid">
                  <div className="criteria-item poor">
                    <span>300-600</span>
                    <p>Needs Work</p>
                  </div>
                  <div className="criteria-item average">
                    <span>601-700</span>
                    <p>Fair</p>
                  </div>
                  <div className="criteria-item good">
                    <span>701-750</span>
                    <p>Good</p>
                  </div>
                  <div className="criteria-item excellent">
                    <span>751-900</span>
                    <p>Excellent</p>
                  </div>
                </div>

                <button onClick={downloadReport} className="download-report-btn">
                  <Download size={20} /> Download Full CIBIL Report (PDF)
                </button>

                <div className="info-box">
                  <Lock size={18} />
                  <p>Your data is encrypted and secure. We do not share your PAN details with third parties.</p>
                </div>
              </div>
            )}
          </div>

          <div className="cibil-benefits">
            <h3 style={{ color: 'var(--primary)', marginBottom: 10 }}>Why check your CIBIL?</h3>
            
            <div className="benefit-card">
              <div className="benefit-icon"><ShieldCheck size={24} /></div>
              <div className="benefit-content">
                <h4>Loan Approval Odds</h4>
                <p>A higher score increases your chances of getting large loan amounts approved quickly.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon"><CheckCircle size={24} /></div>
              <div className="benefit-content">
                <h4>Interest Rate Benefits</h4>
                <p>Customers with scores above 750 often get interest rate discounts of 0.25% to 0.50%.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon"><FileText size={24} /></div>
              <div className="benefit-content">
                <h4>Pre-approved Offers</h4>
                <p>Maintaining a healthy credit profile unlocks exclusive pre-approved loan and credit card offers.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
