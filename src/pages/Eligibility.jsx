import useSEO from '../hooks/useSEO';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Clock, UploadCloud, Lock, Calculator, FileText, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { syncLeadData } from '../lib/syncLeads';
import { saveEnquiry, getEnquiries, deleteEnquiry } from '../lib/db';
import brandLogo from '../assets/avani-brand-logo.png';
import './Eligibility.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ──────────────────────────────────────────────
// ELIGIBILITY CONFIG PER PROFILE
// ──────────────────────────────────────────────
const PROFILE_DOCS = {
  Personal: [
    { key: 'identity_proof', label: 'Identity Proof (Aadhaar, PAN, Passport, or Voter\'s ID)', hint: 'Any 1: Aadhaar Card, PAN Card, Passport, Voter\'s ID', multiple: true },
    { key: 'address_proof', label: 'Address Proof (Aadhaar, Utility Bill, or Driving License)', hint: 'Any 1: Aadhaar Card, Utility Bill (last 3 months), Driving License', multiple: true },
    { key: 'income_docs', label: 'Income Documents (Salary Slips, Bank Statements, Form 16)', hint: 'Last 3 months salary slips, Last 6 months bank statements, and Form 16 (last 2 years)', multiple: true },
    { key: 'employment_proof', label: 'Employment Proof (Employee ID, Appointment or Offer Letter)', hint: 'Employee ID Card, Appointment Letter, or Offer Letter (for new joinees)', multiple: true },
  ],
  Business: [
    { key: 'identity_address', label: 'Identity & Address Proof (Individual + Business PAN, Aadhaar, GST)', hint: 'PAN Card (Individual & Business), Aadhaar Card, GST Registration Certificate', multiple: true },
    { key: 'business_docs', label: 'Business Documents (Udyam / Shop Act, Partnership Deed / MOA)', hint: 'Business Registration / Udyam Certificate, Shop & Establishment Certificate, Partnership Deed / MOA (if applicable)', multiple: true },
    { key: 'financial_docs', label: 'Financial Documents (Last 2 Years ITR, Bank Statements, Balance Sheet)', hint: 'Last 2 years ITR with CA stamp (Acknowledgement, Computation, P&L, Balance Sheet), Last 12 months bank statements, and Last 2 years audited balance sheet', multiple: true },
  ],
  Doctor_Professional_Salaried: [
    { key: 'identity_address', label: 'Identity & Address Proof (PAN, Aadhaar, Photo)', hint: 'PAN Card, Aadhaar Card, Passport size photo', multiple: true },
    { key: 'professional_docs', label: 'Professional Documents (Degree, Reg Certificate)', hint: 'Degree Certificate, Registration Certificate (Old & New)', multiple: true },
    { key: 'income_docs', label: 'Income Documents (Salary Slips, Bank Statements, Form 16)', hint: 'Last 3 months salary slips, Last 6 months bank statements, and Form 16 (last 2 years)', multiple: true },
  ],
  Doctor_Professional_SelfEmployed: [
    { key: 'identity_address', label: 'Identity & Address Proof (PAN, Aadhaar, Photo)', hint: 'PAN Card, Aadhaar Card, Passport size photo', multiple: true },
    { key: 'professional_docs', label: 'Professional Documents (Degree, Reg Certificate, Clinic Reg)', hint: 'Degree Certificate, Registration Certificate (Old & New), Clinic/Hospital Registration', multiple: true },
    { key: 'financial_docs', label: 'Financial Documents (ITR, Bank Statements, Existing Loans)', hint: 'Last 2 years ITR (Acknowledgement, Computation, P&L, Balance Sheet), Last 12 months bank statements (Current & Savings), and Existing loan details (if any)', multiple: true },
  ],
  CA: [
    { key: 'identity_address', label: 'Identity & Address Proof (PAN, Aadhaar, Photo)', hint: 'PAN Card, Aadhaar Card, Passport size photo', multiple: true },
    { key: 'professional_docs', label: 'Professional Documents (COP, ICAI Membership)', hint: 'Certificate of Practice (COP), ICAI Membership Certificate', multiple: true },
    { key: 'financial_docs', label: 'Financial Documents (ITR, Bank Statements, Existing Loans)', hint: 'Last 2 years ITR (Acknowledgement, Computation, P&L), Last 6-12 months bank statements, and Existing loan details (if any)', multiple: true },
  ],
  Home: [
    { key: 'personal_docs', label: 'Personal & Co-applicant KYC (PAN, Aadhaar, Photos)', hint: 'PAN Card, Aadhaar Card, Passport size photo, Co-applicant KYC (PAN, Aadhaar, Photo)', multiple: true },
    { key: 'income_docs', label: 'Income Documents (Salary Slips or ITR, Form 16, Bank Statements)', hint: 'Salary slips / ITR (last 2 years), Form 16 / CA certified accounts, and Bank statements (6 months)', multiple: true },
    { key: 'property_docs', label: 'Property & Mortgage Documents (Title Deed, Sale Agreement, NOC, Valuation)', hint: 'Sale agreement, title deed, NOC, approved plan, tax receipts, encumbrance certificate, valuation report', multiple: true },
  ],
  Education_India: [
    { key: 'student_docs', label: 'Student Academic & KYC Documents (Aadhaar, PAN, Mark Sheets, Admission)', hint: 'Student KYC (Aadhaar & PAN), Mark sheets (10th/12th/Graduation), Admission letter, Fee structure', multiple: true },
    { key: 'coapp_docs', label: 'Co-applicant Documents (KYC, Income Proof, Bank Statements)', hint: 'Co-applicant KYC (PAN & Aadhaar), Income proof (Salary slips / ITR), 6 months bank statements', multiple: true },
    { key: 'additional_docs', label: 'Additional Documents (GRE/GATE, Scholarship, Entrance Exam)', hint: 'GRE/GATE score, Scholarship proof, Entrance exam result', multiple: true },
  ],
  Education_Global: [
    { key: 'student_docs', label: 'Student Academic, Passport & KYC (Aadhaar, PAN, Admission, Test Scores, Visa)', hint: 'Student KYC, Admission letter, Valid Passport, Test scores (IELTS/TOEFL/GRE/GMAT), Visa (if obtained)', multiple: true },
    { key: 'coapp_docs', label: 'Co-applicant Financial Documents (KYC, Income Proof, ITR, Property)', hint: 'Co-applicant KYC, Income proof, 2 years ITR, 1 year bank statements, and Property documents (if collateral)', multiple: true },
  ],
};

function getProfileKey(loanType, subType) {
  if (loanType === 'Doctor / Professional') return subType === 'Self-Employed' ? 'Doctor_Professional_SelfEmployed' : 'Doctor_Professional_Salaried';
  return loanType;
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export default function Eligibility() {
  useSEO({ title: 'Eligibility - Avani Loan Services', description: 'Check your loan eligibility instantly by uploading your documents.', keywords: 'Eligibility, Loan, Avani Finserv, Latur' });

  // ── Form State ──
  const [loanType, setLoanType] = useState('Personal');
  const [subType, setSubType] = useState('Salaried');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [amount, setAmount] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [existingEmi, setExistingEmi] = useState('');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('60');
  const [age, setAge] = useState('30');
  const [cibilScore, setCibilScore] = useState('750');
  const [dpdCount, setDpdCount] = useState('0');
  const [hasDefaults, setHasDefaults] = useState(false);
  const [propertyValue, setPropertyValue] = useState('');
  const [itrIncome1, setItrIncome1] = useState('');
  const [itrIncome2, setItrIncome2] = useState('');
  const [ackIncome, setAckIncome] = useState('');
  const [propertyType, setPropertyType] = useState('Urban');
  const [filesMap, setFilesMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Admin State ──
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const profileKey = getProfileKey(loanType, subType);
  const requiredDocs = PROFILE_DOCS[profileKey] || [];

  // Load enquiries when admin unlocks
  useEffect(() => {
    if (isAdminAuth) loadEnquiries();
  }, [isAdminAuth]);

  const loadEnquiries = async () => {
    const data = await getEnquiries();
    setEnquiries(data.sort((a, b) => b.id - a.id));
  };

  const handleMultipleFileChange = async (docKey, e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    const filePromises = selectedFiles.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
      reader.readAsDataURL(file);
    }));
    const newFiles = await Promise.all(filePromises);
    setFilesMap(prev => ({ ...prev, [docKey]: [...(prev[docKey] || []), ...newFiles] }));
  };

  const removeFile = (docKey, idx) => {
    setFilesMap(prev => {
      const updated = [...(prev[docKey] || [])];
      updated.splice(idx, 1);
      return { ...prev, [docKey]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ── Build multipart FormData ──────────────────────────────
      const formData = new FormData();

      // Password (required by backend)
      formData.append('password', adminPassword || 'Samarth@1356');

      // Metadata JSON
      const meta = {
        timestamp : new Date().toISOString(),
        name,
        phone,
        email,
        loanType,
        amount    : amount || monthlyIncome || '0',
        city,
        source    : 'Website',
        status    : 'Pending',
        aiCallId  : ''
      };
      formData.append('metadata', JSON.stringify(meta));

      // Attach all files as actual File/Blob objects
      for (const [, filesArr] of Object.entries(filesMap)) {
        for (const f of filesArr) {
          const res  = await fetch(f.data);
          const blob = await res.blob();
          formData.append('files', blob, f.name);
        }
      }

      // ── POST to backend ──────────────────────────────────────
      const response = await axios.post('/api/eligibility/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000  // 2 min for large files + OCR
      });

      // ── Save enquiry locally for admin panel ─────────────────
      const income = parseFloat(monthlyIncome) || 0;
      const enquiry = {
        id: Date.now(),
        name, phone, email, city, loanType,
        subType: loanType === 'Doctor / Professional' ? subType : null,
        profileKey, monthlyIncome, existingEmi, rate, tenure, age,
        itrIncome1, itrIncome2, ackIncome, propertyType,
        files: [],
        date: new Date().toISOString()
      };
      await saveEnquiry(enquiry);
      syncLeadData({
        name: name || 'Eligibility User',
        phone: phone || 'N/A',
        loanType,
        amount: parseFloat(amount) || 0,
        income,
        source: 'Eligibility_Upload',
        details: `City: ${city} | Age: ${age}`
      });

      // ── Auto‑download generated Excel ────────────────────────
      if (response.data && response.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.setAttribute('download', response.data.excelFile || 'Eligibility_Report.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsSuccess(true);
      setAdminOpen(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Error processing eligibility: ${errorMsg}\n\nPlease ensure all files are valid (PDF/JPG/PNG, max 10 MB) and try again.`);
      console.error('[Eligibility] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'Samarth@1356') {
      setIsAdminAuth(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this enquiry?')) {
      await deleteEnquiry(id);
      loadEnquiries();
      if (selectedEnquiry?.id === id) { setSelectedEnquiry(null); setCalculation(null); }
    }
  };

  const calculateEligibility = (enq) => {
    setIsCalculating(true);
    setCalculation(null);
    setTimeout(() => {
      const declaredMonthly = parseFloat(enq.monthlyIncome) || 0;
      const emi = parseFloat(enq.existingEmi) || 0;
      const r = parseFloat(enq.rate) || 10.5;
      const n = parseFloat(enq.tenure) || 60;
      const y1 = parseFloat(enq.itrIncome1) || 0;
      const y2 = parseFloat(enq.itrIncome2) || 0;

      // ── 1. Calculate Monthly Income from ITR (Annual Avg / 12) ──
      let itrMonthly = 0;
      if (y1 > 0 && y2 > 0) {
        itrMonthly = ((y1 + y2) / 2) / 12;
      } else if (y1 > 0) {
        itrMonthly = y1 / 12;
      } else if (y2 > 0) {
        itrMonthly = y2 / 12;
      }

      // ── 2. Calculate Extracted Bank Statement Income ─────────────
      let bankExtractedMonthly = 0;
      if (enq.files && Array.isArray(enq.files)) {
        enq.files.forEach(f => {
          if (f.netIncome || f.salary) {
            bankExtractedMonthly += (parseFloat(f.netIncome || f.salary) || 0);
          }
        });
      }

      // ── 3. Determine Effective Monthly Income ────────────────────
      let effectiveIncome = declaredMonthly;
      let incomeSource = 'Declared Monthly Net Income';

      if (itrMonthly > 0) {
        if (declaredMonthly > 0) {
          effectiveIncome = Math.max(declaredMonthly, itrMonthly);
          incomeSource = itrMonthly > declaredMonthly 
            ? `ITR Annual Avg (₹${Math.round(itrMonthly).toLocaleString('en-IN')}/mo)` 
            : `Declared Monthly Net Income (₹${Math.round(declaredMonthly).toLocaleString('en-IN')}/mo)`;
        } else {
          effectiveIncome = itrMonthly;
          incomeSource = `ITR Annual Avg (₹${Math.round(itrMonthly).toLocaleString('en-IN')}/mo)`;
        }
      }

      if (bankExtractedMonthly > 0 && bankExtractedMonthly > effectiveIncome) {
        effectiveIncome = bankExtractedMonthly;
        incomeSource = `Bank Statement Extracted Income (₹${Math.round(bankExtractedMonthly).toLocaleString('en-IN')}/mo)`;
      }

      // ── 4. Determine Dynamic FOIR (Fixed Obligation Ratio) ────────
      let foir = 0.50; // 50% standard
      if (effectiveIncome >= 100000) foir = 0.55; // 55% for HNI
      if (effectiveIncome >= 500000 || enq.profileKey === 'Business' || enq.profileKey === 'CA') foir = 0.50; // 50% default for business

      // ── 5. Compute Available EMI Capacity ───────────────────────
      const emiCapacity = effectiveIncome * foir;
      const availableEmi = emiCapacity - emi;
      const docsVerified = (enq.files?.length || 0) > 0;

      // ── 6. Present Value Loan Amount Formula ─────────────────────
      if (availableEmi <= 0) {
        setCalculation({
          eligible: false,
          maxAmount: 0,
          availableEmi: 0,
          effectiveIncome: Math.round(effectiveIncome),
          incomeSource,
          foirPercent: Math.round(foir * 100),
          existingEmi: emi,
          docsVerified,
          profile: enq.profileKey
        });
      } else {
        const mRate = r / 100 / 12;
        const amount = availableEmi * (Math.pow(1 + mRate, n) - 1) / (mRate * Math.pow(1 + mRate, n));
        setCalculation({
          eligible: true,
          maxAmount: Math.round(amount),
          availableEmi: Math.round(availableEmi),
          effectiveIncome: Math.round(effectiveIncome),
          incomeSource,
          foirPercent: Math.round(foir * 100),
          existingEmi: emi,
          rate: r,
          tenure: n,
          docsVerified,
          profile: enq.profileKey
        });
      }
      setIsCalculating(false);
    }, 800);
  };

  const fmt = n => '₹' + Math.max(0, n).toLocaleString('en-IN');

  return (
    <div className="eligibility-page">
      {/* ── PAGE HEADER ── */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Eligibility Checker</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Secure Loan Eligibility Check</h1>
          <p>Submit your details and mandatory documents. Our system will calculate your eligibility instantly.</p>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section className="section">
        <div className="container emi-container">
          <div className="emi-calculator glass-card">

            {/* Profile Tabs */}
            <div className="calc-tabs">
              {['Personal', 'Business', 'CA', 'Doctor / Professional', 'Home', 'Education_India', 'Education_Global'].map(t => (
                <button
                  key={t}
                  className={loanType === t ? 'active' : ''}
                  onClick={() => { setLoanType(t); setFilesMap({}); }}
                >
                  {t === 'Personal' ? 'Personal / Salary' :
                   t === 'Home' ? 'Home / Mortgage' :
                   t === 'Education_India' ? 'Education (India)' :
                   t === 'Education_Global' ? 'Education (Global)' :
                   t === 'CA' ? 'Chartered Accountant' :
                   t}
                </button>
              ))}
            </div>

            {/* Doctor / Professional Sub-type */}
            {loanType === 'Doctor / Professional' && (
              <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 }}>
                  <input type="radio" checked={subType === 'Salaried'} onChange={() => { setSubType('Salaried'); setFilesMap({}); }} /> Salaried Professional
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 }}>
                  <input type="radio" checked={subType === 'Self-Employed'} onChange={() => { setSubType('Self-Employed'); setFilesMap({}); }} /> Self-Employed Professional
                </label>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Basic Details */}
              <div className="manual-input-grid">
                <div className="slider-group">
                  <label className="input-label">
                    {loanType.startsWith('Education') ? "Student's Full Name" : "Full Name"}
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input manual-box" placeholder={loanType.startsWith('Education') ? "Student's Full Name" : "Your Full Name"} required />
                </div>
                <div className="slider-group">
                  <label className="input-label">
                    {loanType.startsWith('Education') ? "Student / Co-applicant Phone" : "Phone Number"}
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-input manual-box" placeholder="Your Phone Number" required />
                </div>
                <div className="slider-group">
                  <label className="input-label">
                    {loanType.startsWith('Education') ? "Co-applicant's Monthly Net Income" : "Monthly Net Income"}
                  </label>
                  <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} className="form-input manual-box" placeholder="e.g. 50000" required />
                  <p className="input-hint">
                    {loanType.startsWith('Education') ? "Enter co-applicant's net take-home salary or monthly income." : "Enter your net take-home salary per month."}
                  </p>
                </div>
                <div className="slider-group">
                  <label className="input-label">
                    {loanType.startsWith('Education') ? "Co-applicant's Existing EMIs" : "Existing Monthly EMIs"}
                  </label>
                  <input type="number" value={existingEmi} onChange={e => setExistingEmi(e.target.value)} className="form-input manual-box" placeholder="e.g. 5000" required />
                  <p className="input-hint">
                    {loanType.startsWith('Education') ? "Include co-applicant's current loan EMIs and credit card obligations." : "Include all current loan EMIs and credit card obligations."}
                  </p>
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
                  <label className="input-label">
                    {loanType.startsWith('Education') ? "Co-applicant's Age (Years)" : "Age (Years)"}
                  </label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} className="form-input" placeholder={loanType.startsWith('Education') ? "18-70" : "21-60"} />
                </div>
                {(loanType === 'Business' || loanType === 'CA' || (loanType === 'Doctor / Professional' && subType === 'Self-Employed')) && (<>
                  <div className="slider-group">
                    <label className="input-label">ITR Net Income – Year 1 (Annual)</label>
                    <input type="number" value={itrIncome1} onChange={e => setItrIncome1(e.target.value)} className="form-input" placeholder="From Acknowledgement page" />
                  </div>
                  <div className="slider-group">
                    <label className="input-label">ITR Net Income – Year 2 (Annual)</label>
                    <input type="number" value={itrIncome2} onChange={e => setItrIncome2(e.target.value)} className="form-input" placeholder="Previous year income" />
                  </div>
                </>)}
                {loanType === 'Home' && (<>
                  <div className="slider-group">
                    <label className="input-label">Acknowledgement Net Income</label>
                    <input type="number" value={ackIncome} onChange={e => setAckIncome(e.target.value)} className="form-input" placeholder="From Ack page" />
                  </div>
                  <div className="slider-group">
                    <label className="input-label">Property Type</label>
                    <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="form-input">
                      <option value="Urban">Urban (City Area)</option>
                      <option value="Rural">Rural (Gavthan)</option>
                      <option value="8A">8A Extract (Property)</option>
                      <option value="7/12">7/12 Extract (Satbara)</option>
                    </select>
                  </div>
                </>)}
              </div>

              {/* ── DOCUMENT UPLOAD SECTION ── */}
              <div className="docs-upload-section">
                <h3 className="docs-upload-title"><UploadCloud size={22} /> Compulsory Documents – {loanType === 'Education_India' ? 'Education Loan (India)' : loanType === 'Education_Global' ? 'Education Loan (Global)' : loanType}{loanType === 'Doctor / Professional' ? ` (${subType})` : ''}</h3>
                <p className="docs-upload-subtitle">Upload scanned copies, photocopies, or PDFs. Multiple files allowed per category.</p>

                <div className="docs-list">
                  {requiredDocs.map((doc, i) => (
                    <div key={doc.key} className="doc-upload-row">
                      <div className="doc-upload-header">
                        <div className="doc-upload-info">
                          <span className="doc-num">{i + 1}</span>
                          <div>
                            <strong className="doc-label">{doc.label} <span style={{ color: '#ef4444' }}>*</span></strong>
                            <p className="doc-hint">{doc.hint}</p>
                          </div>
                        </div>
                        <label className={`btn-upload-doc ${filesMap[doc.key]?.length > 0 ? 'uploaded' : ''}`} htmlFor={`file-${doc.key}`}>
                          <UploadCloud size={16} />
                          {filesMap[doc.key]?.length > 0 ? `${filesMap[doc.key].length} Uploaded` : 'Upload Files'}
                          <input
                            id={`file-${doc.key}`}
                            type="file"
                            multiple={doc.multiple}
                            accept="image/*,application/pdf"
                            onChange={(e) => handleMultipleFileChange(doc.key, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      {/* Uploaded File List */}
                      {filesMap[doc.key]?.length > 0 && (
                        <div className="uploaded-files-list">
                          {filesMap[doc.key].map((file, idx) => (
                            <div key={idx} className="uploaded-file-item">
                              <CheckCircle2 size={14} color="#16a34a" />
                              <span className="uploaded-file-name">{file.name}</span>
                              <button type="button" className="remove-file-btn" onClick={() => removeFile(doc.key, idx)}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary submit-calc" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading & Submitting...' : 'Submit for Eligibility Check'} <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* ── RESULTS SIDE ── */}
          <div id="results-section" className="emi-results">
            {isSuccess ? (
              <div className="emi-qualify glass-card animate-slide-up" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle2 color="#16a34a" size={64} style={{ margin: '0 auto 20px', display: 'block' }} />
                <h3>Documents Submitted!</h3>
                <p style={{ fontSize: '1.05rem', margin: '15px 0', lineHeight: 1.7 }}>
                  Your profile and all documents have been securely saved. Scroll down to the <strong>Admin Panel</strong> below, enter the password, and click <strong>"Eligibility Calculator"</strong> to view your instant result.
                </p>
                <a href={`https://wa.me/919175635165?text=Hi, I submitted my ${loanType === 'Education_India' ? 'Education Loan (India)' : loanType === 'Education_Global' ? 'Education Loan (Global)' : loanType} loan eligibility documents.`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ marginTop: 20, width: '100%', justifyContent: 'center', background: '#25D366', color: '#fff', border: 'none' }}>
                  Connect on WhatsApp Now
                </a>
              </div>
            ) : (
              <div className="waiting-card glass-card">
                <ShieldCheck size={48} className="wait-icon" color="#0f4c81" />
                <h3>Secure Upload System</h3>
                <p>Your documents are compulsory for generating accurate eligibility. Please fill the form and upload them securely.</p>
              </div>
            )}

            <div className="eligibility-knowledge">
              <h4>Key Eligibility Factors</h4>
              <div className="factor-list">
                <div className="factor-item"><UserCheck size={20} className="factor-icon" /><div><strong>Income & Expenses</strong><p>Net income vs. existing EMIs determine FOIR.</p></div></div>
                <div className="factor-item"><ShieldCheck size={20} className="factor-icon" /><div><strong>Credit Score</strong><p>710+ score preferred for favorable rates.</p></div></div>
                <div className="factor-item"><Clock size={20} className="factor-icon" /><div><strong>Age & Tenure</strong><p>Affects maximum repayment period allowed.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ── ADMIN PANEL (Password Protected) ──
      ══════════════════════════════════════════════ */}
      <section id="admin-panel" className="section" style={{ background: '#0f172a', borderTop: '4px solid #c9a84c', paddingTop: 40 }}>
        <div className="container">

          {/* Collapsible Header */}
          <button
            className="admin-panel-toggle"
            onClick={() => setAdminOpen(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: '1px solid #334155', borderRadius: 8, padding: '14px 20px', color: '#94a3b8', cursor: 'pointer', width: '100%', marginBottom: adminOpen ? 30 : 0, fontSize: '1rem' }}
          >
            <Lock size={20} color="#c9a84c" />
            <span style={{ flex: 1, textAlign: 'left' }}>Admin Eligibility Panel — Staff Only</span>
            {adminOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {adminOpen && (
            <div className="admin-panel-body">
              {!isAdminAuth ? (
                /* ── Login Form ── */
                <form onSubmit={handleAdminLogin} className="admin-login-box">
                  <Lock size={40} color="#c9a84c" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>Admin Access Required</h3>
                  <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.9rem' }}>Enter the admin password to view leads and calculate eligibility.</p>
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="form-input"
                    style={{ marginBottom: 16, background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock Admin Panel</button>
                </form>
              ) : (
                /* ── Admin Dashboard ── */
                <div className="admin-dashboard-inner">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ color: '#f1f5f9', margin: 0 }}>
                      🟢 {enquiries.length} Enquir{enquiries.length !== 1 ? 'ies' : 'y'} Received
                    </h3>
                    <button onClick={loadEnquiries} className="btn-small btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>

                  <div className="admin-split">
                    {/* Left: Lead List */}
                    <div className="admin-lead-list">
                      {enquiries.length === 0 ? (
                        <p style={{ color: '#475569', textAlign: 'center', padding: 30 }}>No submissions yet.</p>
                      ) : enquiries.map(enq => (
                        <div
                          key={enq.id}
                          className={`admin-lead-item ${selectedEnquiry?.id === enq.id ? 'active' : ''}`}
                          onClick={() => { setSelectedEnquiry(enq); setCalculation(null); }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: '#f1f5f9' }}>{enq.name || 'Anonymous'}</strong>
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(enq.date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{enq.loanType === 'Education_India' ? 'Education (India)' : enq.loanType === 'Education_Global' ? 'Education (Global)' : enq.loanType}{enq.subType ? ` · ${enq.subType}` : ''} · {enq.phone}</span>
                            <button className="del-btn" onClick={(e) => handleDelete(enq.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={14} color="#ef4444" />
                            </button>
                          </div>
                          <div style={{ marginTop: 4, fontSize: '0.8rem', color: '#475569' }}>
                            📁 {enq.files?.length || 0} document(s) · ₹{parseInt(enq.monthlyIncome || 0).toLocaleString('en-IN')}/mo income
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Detail & Calculator */}
                    <div className="admin-detail-panel">
                      {selectedEnquiry ? (
                        <>
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                              <div>
                                <h4 style={{ color: '#f1f5f9', margin: '0 0 4px' }}>{selectedEnquiry.name}</h4>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedEnquiry.phone} · {selectedEnquiry.loanType === 'Education_India' ? 'Education (India)' : selectedEnquiry.loanType === 'Education_Global' ? 'Education (Global)' : selectedEnquiry.loanType}{selectedEnquiry.subType ? ` (${selectedEnquiry.subType})` : ''}</span>
                              </div>
                              <span className="badge" style={{ background: '#1e3a5f' }}>{selectedEnquiry.profileKey}</span>
                            </div>

                            {/* Key Numbers */}
                            <div className="admin-data-grid">
                              {[
                                [selectedEnquiry.loanType.startsWith('Education') ? 'Co-app Income' : 'Monthly Income', '₹' + (parseInt(selectedEnquiry.monthlyIncome || 0)).toLocaleString('en-IN')],
                                [selectedEnquiry.loanType.startsWith('Education') ? 'Co-app EMIs' : 'Existing EMIs', '₹' + (parseInt(selectedEnquiry.existingEmi || 0)).toLocaleString('en-IN')],
                                ['Rate', selectedEnquiry.rate + '% p.a.'],
                                ['Tenure', selectedEnquiry.tenure + ' months'],
                                [selectedEnquiry.loanType.startsWith('Education') ? 'Co-app Age' : 'Age', selectedEnquiry.age + ' yrs'],
                                ['ITR Y1', selectedEnquiry.itrIncome1 ? '₹' + parseInt(selectedEnquiry.itrIncome1).toLocaleString('en-IN') : '—'],
                                ['ITR Y2', selectedEnquiry.itrIncome2 ? '₹' + parseInt(selectedEnquiry.itrIncome2).toLocaleString('en-IN') : '—'],
                                ['Documents', (selectedEnquiry.files?.length || 0) + ' files uploaded'],
                              ].map(([k, v]) => (
                                <div key={k} className="admin-data-cell">
                                  <span className="admin-data-label">{k}</span>
                                  <span className="admin-data-value">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Documents */}
                          {selectedEnquiry.files?.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                              <h5 style={{ color: '#94a3b8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={16} /> Uploaded Documents
                              </h5>
                              <div className="admin-docs-grid">
                                {selectedEnquiry.files.map((f, i) => (
                                  <div key={i} className="admin-doc-card">
                                    <span className="admin-doc-label">{f.docName || f.docKey}</span>
                                    <span className="admin-doc-name">{f.name}</span>
                                    <a href={f.data} download={f.name} className="btn-small btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>View / Download</a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ── ELIGIBILITY CALCULATOR BUTTON ── */}
                          <button
                            onClick={() => calculateEligibility(selectedEnquiry)}
                            className="btn btn-primary"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: '1.05rem', padding: '14px 20px', background: 'linear-gradient(135deg, #c9a84c, #f0c96a)', color: '#0f172a', fontWeight: 700, border: 'none' }}
                            disabled={isCalculating}
                          >
                            <Calculator size={22} />
                            {isCalculating ? 'Analysing Documents & Calculating...' : '⚡ Master Eligibility Calculator'}
                          </button>

                          {/* ── RESULT ── */}
                          {calculation && (
                            <div className={`eligibility-result-box ${calculation.eligible ? 'eligible' : 'ineligible'}`}>
                              <div className="result-header">
                                {calculation.eligible
                                  ? <CheckCircle2 size={32} color="#16a34a" />
                                  : <AlertCircle size={32} color="#ef4444" />}
                                <div>
                                  <h4 style={{ margin: '0 0 2px' }}>
                                    {calculation.eligible ? '✅ PRE-SANCTION ELIGIBLE' : '❌ NOT ELIGIBLE'}
                                  </h4>
                                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                    Profile: {calculation.profile} · Approval Probability: <strong>{calculation.approvalChance || 'High'}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="result-amount">{fmt(calculation.maxAmount)}</div>
                              <p className="result-sub">Maximum Eligible Loan Amount</p>

                              {/* ── Underwriting Key Metrics ── */}
                              <div className="result-meta" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, margin: '16px 0', background: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 8 }}>
                                <div><span style={{ opacity: 0.7, fontSize: '0.8rem' }}>Effective Monthly Income:</span><br/><strong>{fmt(calculation.effectiveIncome)}/mo</strong></div>
                                <div><span style={{ opacity: 0.7, fontSize: '0.8rem' }}>Applied FOIR Cap:</span><br/><strong>{calculation.foirPercent}%</strong></div>
                                <div><span style={{ opacity: 0.7, fontSize: '0.8rem' }}>Net Disposable Income (NDI):</span><br/><strong>{fmt(calculation.ndi || 0)}/mo</strong></div>
                                <div><span style={{ opacity: 0.7, fontSize: '0.8rem' }}>Credit Risk Level:</span><br/><strong style={{ color: calculation.riskLevel === 'High' ? '#f87171' : '#4ade80' }}>{calculation.riskLevel || 'Low'} Risk</strong></div>
                              </div>

                              {/* ── Recommended Banks ── */}
                              {calculation.recommendedLenders?.length > 0 && (
                                <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, textAlign: 'left' }}>
                                  <h5 style={{ color: '#c9a84c', margin: '0 0 8px', fontSize: '0.9rem' }}>🏛️ Recommended Lenders & NBFC Partners:</h5>
                                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: '#cbd5e1' }}>
                                    {calculation.recommendedLenders.map((l, i) => (
                                      <li key={i}><strong>{l.name}</strong> — {l.note}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* ── Risk & Positives ── */}
                              <div style={{ marginTop: 14, fontSize: '0.85rem', textAlign: 'left' }}>
                                {calculation.riskFactors?.length > 0 && (
                                  <div style={{ color: '#fca5a5', marginBottom: 6 }}>
                                    ⚠️ <strong>Risk Factors:</strong> {calculation.riskFactors.join(' | ')}
                                  </div>
                                )}
                                {calculation.positiveFactors?.length > 0 && (
                                  <div style={{ color: '#86efac' }}>
                                    ✨ <strong>Strengths:</strong> {calculation.positiveFactors.join(' | ')}
                                  </div>
                                )}
                              </div>

                              {/* ── RBI Disclaimer ── */}
                              <p style={{ marginTop: 16, fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                                📌 {calculation.disclaimer || 'This is a preliminary eligibility assessment based on RBI lending guidelines. Final approval depends upon lender underwriting, document verification, legal title search, and property valuation.'}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
                          <Calculator size={48} color="#334155" style={{ margin: '0 auto 16px', display: 'block' }} />
                          <h4 style={{ color: '#64748b' }}>Select a lead from the left</h4>
                          <p>Click any submitted enquiry to review their documents and run the eligibility calculator.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section bg-light">
        <div className="container">
          <div className="educational-content">
            <div className="edu-grid">
              <div className="edu-block">
                <h2>How Does It Work?</h2>
                <ol className="edu-list">
                  <li><strong>Select Profile:</strong> Choose Salaried, Business, Doctor or Home Loan.</li>
                  <li><strong>Upload Documents:</strong> Upload compulsory docs per your profile (multiple files allowed).</li>
                  <li><strong>Submit:</strong> Click Submit to securely save your profile.</li>
                  <li><strong>Admin Review:</strong> Our team reviews and generates your exact eligibility instantly.</li>
                </ol>
              </div>
              <div className="edu-block">
                <h2>Why Upload Documents?</h2>
                <p>Documents enable accurate, real-time eligibility without a branch visit.</p>
                <div className="logic-steps">
                  <div className="step"><span className="step-num">1</span><p><strong>Accuracy:</strong> Real income data from actual documents.</p></div>
                  <div className="step"><span className="step-num">2</span><p><strong>Speed:</strong> No manual entry — instant result.</p></div>
                  <div className="step"><span className="step-num">3</span><p><strong>Security:</strong> Stored locally and confidentially.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
