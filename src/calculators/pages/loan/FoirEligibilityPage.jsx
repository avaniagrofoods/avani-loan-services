import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, FileText, LockKeyhole, RotateCcw, ShieldCheck, UploadCloud, X } from 'lucide-react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import { calculateFOIREligibility } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import '../../styles/calculators.css';
import '../../styles/foir-assessment.css';

const PRODUCTS = [
  { key: 'salary', label: 'Salary Loan' },
  { key: 'business', label: 'Business Loan' },
  { key: 'education_india', label: 'Education Loan — India' },
  { key: 'education_global', label: 'Education Loan — Global Studies' },
  { key: 'home', label: 'Home Loan' },
  { key: 'mortgage_lap', label: 'Mortgage / LAP' },
  { key: 'ca', label: 'Chartered Accountant Loan' },
  { key: 'doctor_professional', label: 'Doctor / Professional Loan' },
  { key: 'school_college', label: 'School & College Funding' }
];

const CHECKLISTS = {
  salary: ['PAN / Identity Proof', 'Address Proof', 'Latest Salary Slips', 'Bank Statements', 'Existing Loan Statements'],
  business: ['PAN / Identity Proof', 'Address Proof', 'Business Registration / Proof', 'ITR / Financial Statements', 'Bank Statements', 'Existing Loan Statements', 'GST Documents where applicable'],
  education_india: ['Student KYC', 'Admission / Offer Letter', 'Fee Structure', 'Co-applicant KYC', 'Income Proof', 'Bank Statements', 'Existing Loan Statements'],
  education_global: ['Passport', 'Admission / Offer Letter', 'University Fee Structure', 'Academic Documents', 'Co-applicant KYC', 'Income Proof', 'Bank Statements', 'Existing Loan Statements'],
  home: ['PAN / Identity Proof', 'Address Proof', 'Income Proof', 'Bank Statements', 'Existing Loan Statements', 'Property / Agreement Documents'],
  mortgage_lap: ['PAN / Identity Proof', 'Address Proof', 'Income Proof', 'ITR / Financial Statements', 'Bank Statements', 'Existing Loan Statements', 'Property Ownership / Title Documents'],
  ca: ['PAN / Identity Proof', 'Address Proof', 'CA Membership / Professional Proof', 'ITR / Income Proof', 'Bank Statements', 'Existing Loan Statements', 'Practice / Business Proof'],
  doctor_professional: ['PAN / Identity Proof', 'Address Proof', 'Professional Registration / Certificate', 'Income Proof', 'ITR', 'Bank Statements', 'Existing Loan Statements', 'Practice / Business Proof'],
  school_college: ['Institution Registration / Proof', 'Promoter / Director KYC', 'Financial Statements', 'Bank Statements', 'Existing Loan Statements', 'Revenue / Fee Information']
};

const FILE_GROUPS = [
  { key: 'incomeProof', title: 'Income Proof', help: 'Salary slips, ITR, financial statements or professional income proof.' },
  { key: 'bankStatements', title: 'Bank Statements — Read Only', help: 'PDF, JPG, JPEG or PNG. Clear scanned statements are supported.' },
  { key: 'existingLoanStatements', title: 'Existing Loan Statements — Read Only', help: 'Upload current loan statements so existing obligations can be reviewed.' },
  { key: 'otherDocuments', title: 'Other Product Documents', help: 'KYC, property, admission, professional or institution documents.' }
];

function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FoirEligibilityPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ applicantName: '', phone: '', email: '', city: '', productKey: 'salary', monthlyIncome: '', existingEmi: '0', foirPercent: '50', rate: '9.5', tenureYears: '15' });
  const [files, setFiles] = useState({ incomeProof: [], bankStatements: [], existingLoanStatements: [], otherDocuments: [] });

  const calculatorResult = useMemo(() => calculateFOIREligibility({
    monthlyIncome: parseNumber(form.monthlyIncome), existingEmi: parseNumber(form.existingEmi), foirPercent: parseNumber(form.foirPercent, 50), rate: parseNumber(form.rate, 9.5), tenureYears: parseNumber(form.tenureYears, 15)
  }), [form.monthlyIncome, form.existingEmi, form.foirPercent, form.rate, form.tenureYears]);

  const selectedProduct = PRODUCTS.find((p) => p.key === form.productKey) || PRODUCTS[0];
  const checklist = CHECKLISTS[form.productKey] || CHECKLISTS.salary;
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addFiles = (key, fileList) => {
    const incoming = Array.from(fileList || []);
    setFiles((prev) => ({ ...prev, [key]: [...prev[key], ...incoming].slice(0, key === 'otherDocuments' ? 10 : 6) }));
    setError('');
  };
  const removeFile = (key, index) => setFiles((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  const reset = () => {
    setStep(1); setError(''); setResult(null);
    setForm({ applicantName: '', phone: '', email: '', city: '', productKey: 'salary', monthlyIncome: '', existingEmi: '0', foirPercent: '50', rate: '9.5', tenureYears: '15' });
    setFiles({ incomeProof: [], bankStatements: [], existingLoanStatements: [], otherDocuments: [] });
  };

  const validateStep = (targetStep) => {
    setError('');
    if (targetStep === 2 && (!form.applicantName.trim() || !form.phone.trim() || !form.city.trim())) { setError('Please complete your name, mobile number and city before continuing.'); return false; }
    if (targetStep === 3 && parseNumber(form.monthlyIncome) <= 0) { setError('Please enter a valid monthly income greater than zero.'); return false; }
    return true;
  };
  const next = () => { if (validateStep(step + 1)) setStep((s) => Math.min(4, s + 1)); };
  const back = () => { setError(''); setStep((s) => Math.max(1, s - 1)); };

  const submitAssessment = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true); setError('');
    const data = new FormData();
    data.append('payload', JSON.stringify(form));
    Object.entries(files).forEach(([key, group]) => group.forEach((file) => data.append(key, file)));
    try {
      const response = await fetch('/api/eligibility/foir-assessment', { method: 'POST', credentials: 'same-origin', body: data });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Assessment could not be completed.');
      setResult(payload.data); setStep(5);
    } catch (err) { setError(err.message || 'Assessment failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const progress = step === 5 ? 100 : (step / 4) * 100;

  return (
    <CalculatorLayout>
      <div className="foir-page">
        <section className="foir-hero">
          <div className="foir-hero-badge"><ShieldCheck size={15} /> AVANI LOAN SERVICES • PROTECTED ELIGIBILITY</div>
          <h2>Eligibility Calculator (FOIR)</h2>
          <p>Estimate indicative loan eligibility and securely submit product-wise documents for read-only assessment.</p>
          <div className="foir-progress" aria-label="Eligibility progress"><span style={{ width: `${progress}%` }} /></div>
        </section>
        {error && <div className="foir-error"><AlertTriangle size={18} />{error}</div>}

        {step < 5 && <div className="foir-stepper">{['Applicant', 'Product', 'Financials', 'Documents'].map((label, index) => { const number = index + 1; return <div key={label} className={`foir-step ${step >= number ? 'active' : ''}`}><span>{number}</span><b>{label}</b></div>; })}</div>}

        {step === 1 && <section className="foir-card foir-form-card">
          <div className="foir-section-title"><div className="foir-icon"><FileText size={19} /></div><div><h3>Step 1: Applicant Information</h3><p>We use these details only to identify the assessment.</p></div></div>
          <div className="foir-grid-2">
            <label>Full Name<input value={form.applicantName} onChange={(e) => update('applicantName', e.target.value)} placeholder="Enter applicant name" /></label>
            <label>Mobile Number<input value={form.phone} onChange={(e) => update('phone', e.target.value)} inputMode="tel" placeholder="10-digit mobile number" /></label>
            <label>Email Address<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" /></label>
            <label>City<input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g. Latur" /></label>
          </div>
          <div className="foir-actions"><Link to="/calculators" className="calc-btn calc-btn-secondary"><ArrowLeft size={17} /> Back to Calculators</Link><button className="calc-btn calc-btn-primary" onClick={next}>Next <ArrowRight size={17} /></button></div>
        </section>}

        {step === 2 && <section className="foir-card foir-form-card">
          <div className="foir-section-title"><div className="foir-icon"><FileCheck2 size={19} /></div><div><h3>Step 2: Select Loan Product</h3><p>Document requirements change automatically with the selected product.</p></div></div>
          <div className="foir-product-grid">{PRODUCTS.map((product) => <button key={product.key} type="button" className={`foir-product ${form.productKey === product.key ? 'selected' : ''}`} onClick={() => update('productKey', product.key)}><span>{product.label}</span>{form.productKey === product.key && <CheckCircle2 size={17} />}</button>)}</div>
          <div className="foir-note"><LockKeyhole size={17} /><span>Education Loans support India/Global and secured/unsecured assessment paths. School & College Funding supports secured/unsecured review through the document checklist.</span></div>
          <div className="foir-actions"><button className="calc-btn calc-btn-secondary" onClick={back}><ArrowLeft size={17} /> Back</button><button className="calc-btn calc-btn-primary" onClick={next}>Continue to Financials <ArrowRight size={17} /></button></div>
        </section>}

        {step === 3 && <section className="foir-card foir-form-card">
          <div className="foir-section-title"><div className="foir-icon"><ShieldCheck size={19} /></div><div><h3>Step 3: FOIR Financial Assessment</h3><p>Enter the values you want the deterministic FOIR engine to use.</p></div></div>
          <div className="foir-grid-2">
            <label>Net Monthly Income (₹)<input type="number" value={form.monthlyIncome} onChange={(e) => update('monthlyIncome', e.target.value)} min="0" placeholder="e.g. 75000" /></label>
            <label>Existing Monthly EMIs (₹)<input type="number" value={form.existingEmi} onChange={(e) => update('existingEmi', e.target.value)} min="0" placeholder="e.g. 15000" /></label>
            <label>FOIR Limit (%)<input type="number" value={form.foirPercent} onChange={(e) => update('foirPercent', e.target.value)} min="1" max="90" step="1" /></label>
            <label>Expected Interest Rate (% p.a.)<input type="number" value={form.rate} onChange={(e) => update('rate', e.target.value)} min="0" max="50" step="0.1" /></label>
            <label>Desired Tenure (Years)<input type="number" value={form.tenureYears} onChange={(e) => update('tenureYears', e.target.value)} min="1" max="40" step="1" /></label>
          </div>
          <div className="foir-live-result"><div><span>Available EMI Capacity</span><strong>{formatINR(calculatorResult.availableEmi)}</strong></div><div><span>Indicative Loan Eligibility</span><strong>{formatINR(calculatorResult.eligibleLoanAmount)}</strong></div></div>
          <div className="foir-actions"><button className="calc-btn calc-btn-secondary" onClick={back}><ArrowLeft size={17} /> Back</button><button className="calc-btn calc-btn-primary" onClick={next}>Review Documents <ArrowRight size={17} /></button></div>
        </section>}

        {step === 4 && <section className="foir-card foir-form-card">
          <div className="foir-section-title"><div className="foir-icon"><UploadCloud size={19} /></div><div><h3>Step 4: Product-wise Document Upload</h3><p>Bank statements and existing loan statements are processed as read-only source documents.</p></div></div>
          <div className="foir-checklist"><h4>Required for {selectedProduct.label}</h4><div>{checklist.map((item) => <span key={item}><CheckCircle2 size={15} />{item}</span>)}</div></div>
          <div className="foir-upload-grid">{FILE_GROUPS.map((group) => <div className="foir-upload-box" key={group.key}>
            <div className="foir-upload-head"><div><h4>{group.title}</h4><p>{group.help}</p></div><UploadCloud size={20} /></div>
            <input id={`upload-${group.key}`} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" multiple onChange={(e) => { addFiles(group.key, e.target.files); e.target.value = ''; }} />
            <label htmlFor={`upload-${group.key}`} className="foir-upload-label">Choose PDF / Image files</label>
            {files[group.key].length > 0 && <div className="foir-file-list">{files[group.key].map((file, index) => <div className="foir-file" key={`${file.name}-${index}`}><FileText size={15} /><span><b>{file.name}</b><small>{formatFileSize(file.size)} • Read-only source</small></span><button type="button" onClick={() => removeFile(group.key, index)} aria-label={`Remove ${file.name}`}><X size={15} /></button></div>)}</div>}
          </div>)}</div>
          <div className="foir-security"><LockKeyhole size={18} /><div><b>Document security</b><p>Accepted files are PDF, JPG, JPEG and PNG up to 15 MB each. The assessment API reads the source temporarily and removes the temporary upload after processing. Source documents are not edited.</p></div></div>
          <div className="foir-actions"><button className="calc-btn calc-btn-secondary" onClick={back}><ArrowLeft size={17} /> Back</button><button className="calc-btn calc-btn-primary" onClick={submitAssessment} disabled={submitting}>{submitting ? 'Processing Documents…' : 'Submit & Get Eligibility'} <CheckCircle2 size={17} /></button></div>
        </section>}

        {step === 5 && result && <section className="foir-result-page">
          <div className="foir-success"><CheckCircle2 size={25} /><div><h3>Indicative Eligibility Assessment Complete</h3><p>Application {result.applicationId} • {result.product}</p></div></div>
          <div className="foir-result-grid">
            <div className="foir-result-primary"><span>Estimated Eligible Loan Amount</span><strong>{formatINR(result.eligibleLoanAmount)}</strong><small>Based on supplied income, existing EMI, FOIR, rate and tenure.</small></div>
            <div className="foir-result-metric"><span>Available EMI Capacity</span><strong>{formatINR(result.availableEmi)}</strong></div>
            <div className="foir-result-metric"><span>Estimated EMI</span><strong>{formatINR(result.estimatedEmi)}</strong></div>
            <div className="foir-result-metric"><span>Estimated Interest</span><strong>{formatINR(result.estimatedInterest)}</strong></div>
            <div className="foir-result-metric"><span>FOIR Used</span><strong>{result.foirPercent}%</strong></div>
            <div className="foir-result-metric"><span>Tenure</span><strong>{result.tenureYears} Years</strong></div>
          </div>
          <div className="foir-card"><div className="foir-result-heading"><h3>Read-only Document Analysis</h3><span><LockKeyhole size={15} /> Source files not modified</span></div>{result.documents?.length ? <div className="foir-document-table">{result.documents.map((doc, index) => <div className="foir-document-row" key={`${doc.fileName}-${index}`}><FileText size={17} /><div><b>{doc.fileName}</b><small>{doc.category} • {doc.status}</small></div><span>{doc.bankName || 'No bank name detected'}{doc.monthlyIncomeDetected ? ` • Income detected: ${formatINR(doc.monthlyIncomeDetected)}` : ''}</span></div>)}</div> : <p className="foir-muted">No documents were uploaded. The calculation used the entered financial values.</p>}</div>
          <div className="foir-card"><div className="foir-result-heading"><h3>Product Document Status</h3><span>{result.requiredChecklist?.filter((x) => x.uploaded).length || 0}/{result.requiredChecklist?.length || 0} categories detected</span></div><div className="foir-checklist result-checklist">{result.requiredChecklist?.map((item) => <div key={item.name} className={item.uploaded ? 'done' : ''}><span>{item.uploaded ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}{item.name}</span><b>{item.uploaded ? 'Received' : 'Pending / Verify'}</b></div>)}</div></div>
          <div className="foir-disclaimer"><AlertTriangle size={19} /><div><b>Important</b><p>{result.disclaimer}</p></div></div>
          <div className="foir-actions result-actions"><a className="calc-btn calc-btn-primary" href={`https://wa.me/919175635165?text=${encodeURIComponent(`Hello AVANI LOAN SERVICES. I completed the FOIR eligibility assessment. Application ID: ${result.applicationId}. Product: ${result.product}. Indicative eligibility: ₹${Number(result.eligibleLoanAmount).toLocaleString('en-IN')}. Please review my application.`)}`} target="_blank" rel="noreferrer">📲 Talk to Advisor on WhatsApp</a><button className="calc-btn calc-btn-secondary" onClick={reset}><RotateCcw size={17} /> Start New Assessment</button></div>
        </section>}
      </div>
    </CalculatorLayout>
  );
}
