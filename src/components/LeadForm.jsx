import { useState } from 'react';
import { CheckCircle, Loader, Phone } from 'lucide-react';
import './LeadForm.css';
import vapiService from '../lib/vapiService';

const ZOHO_URL = 'https://crmplus.zoho.in/starpowerzlatur22101/index.do/cxapp/crm/org60057545957/settings/connected-workflow';

export default function LeadForm({ compact = false, loanType = '' }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', loanType: loanType, amount: '', city: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | ai-calling
  const [showAIOption, setShowAIOption] = useState(false);
  const [aiCallStatus, setAICallStatus] = useState('ready'); // ready | calling | connected | ended

  const loanTypes = ['Salary Loan', 'Business Loan', 'Education Loan (India)', 'Education Loan (Abroad)', 'Home Loan', 'Mortgage / LAP'];

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAICall = async e => {
    e.preventDefault();
    setAICallStatus('calling');
    
    try {
      // Map traditional loan types to VAPI loan types
      const vapiLoanType = form.loanType.toLowerCase().includes('salary') ? 'personal' :
        form.loanType.toLowerCase().includes('business') ? 'business' :
        form.loanType.toLowerCase().includes('education') ? 'education' :
        form.loanType.toLowerCase().includes('home') ? 'home' :
        form.loanType.toLowerCase().includes('mortgage') ? 'mortgage' : 'personal';

      const callResult = await vapiService.makeCall(form.phone, '9f322737-3bb8-467a-95e3-7a66f9a93dc1', vapiLoanType);
      
      if (callResult.id) {
        setAICallStatus('connected');
        
        // Save lead data with AI call initiation
        await vapiService.saveLeadData({
          name: form.name,
          phone: form.phone,
          email: form.email,
          loanType: form.loanType,
          amount: form.amount,
          city: form.city || 'Latur',
          callId: callResult.id,
          aiCallInitiated: true,
          timestamp: new Date().toISOString()
        });

        setTimeout(() => {
          setAICallStatus('ended');
          setStatus('success');
        }, 3000);
      }
    } catch (error) {
      console.error('AI call error:', error);
      setAICallStatus('ready');
      alert('Error initiating AI call. Please try again.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Submit to Zoho CRM via fetch (no-cors for cross-origin Zoho endpoints)
      const body = new URLSearchParams({
        'Lead Name': form.name,
        'Mobile': form.phone,
        'Email': form.email,
        'Lead Source': 'Website',
        'Loan Type': form.loanType,
        'Loan Amount': form.amount,
        'City': form.city || 'Latur',
        'Description': `Website lead - Loan Type: ${form.loanType}, Amount: ${form.amount}`
      });

      await fetch(ZOHO_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      // Open WhatsApp notification as backup
      const waMsg = encodeURIComponent(
        `Hello! I'm ${form.name} from ${form.city || 'Maharashtra'}. I'm interested in a ${form.loanType} of ₹${form.amount}. Please contact me at ${form.phone}.`
      );
      const waLink = `https://wa.me/917249108474?text=${waMsg}`;
      window.open(waLink, '_blank', 'noopener noreferrer');

      setStatus('success');
    } catch {
      setStatus('success'); // Show success regardless (no-cors won't give real errors)
    }
  };

  if (status === 'success') {
    return (
      <div className="form-success animate-fade-in">
        <CheckCircle size={48} color="#22c55e" />
        <h3>Application Submitted!</h3>
        <p>Thank you {form.name}! Our loan advisor will call you within 5 minutes.</p>
        <p className="wa-note">A WhatsApp message has also been opened for you.</p>
        <button className="btn btn-primary" onClick={() => setStatus('idle')}>Submit Another</button>
      </div>
    );
  }

  return (
    <form className={`lead-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      {!compact && <h3 className="form-title">Get Free Loan Consultation</h3>}

      <div className={compact ? 'compact-grid' : ''}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Mobile Number *</label>
          <input className="form-input" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 XXXXXXXXXX" required pattern="[0-9+\-\s]{10,13}" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Loan Type *</label>
          <select className="form-select" name="loanType" value={form.loanType} onChange={handleChange} required>
            <option value="">-- Select Loan Type --</option>
            {loanTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Loan Amount (₹) *</label>
          <input className="form-input" name="amount" value={form.amount} onChange={handleChange} placeholder="e.g. 5,00,000" required />
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="Your city" />
        </div>
      </div>

      <button type="submit" className="btn btn-secondary submit-btn" disabled={status === 'loading'}>
        {status === 'loading' ? <><Loader size={18} className="spin" /> Processing...</> : '🚀 Get Free Callback'}
      </button>

      {status === 'idle' && !compact && (
        <div className="ai-call-option">
          <p className="or-divider">─── OR ───</p>
          <button 
            type="button" 
            onClick={() => handleAICall(new Event('submit'))}
            className="btn btn-ai-call"
            disabled={!form.name || !form.phone || !form.loanType}
          >
            {aiCallStatus === 'calling' ? (
              <><Loader size={18} className="spin" /> AI Calling...</>
            ) : aiCallStatus === 'connected' ? (
              <><Phone size={18} /> Call Connected...</>
            ) : (
              <><Phone size={18} /> Get Instant AI Call</>
            )}
          </button>
          <p className="ai-call-note">🤖 Speak with our AI Loan Advisor instantly</p>
        </div>
      )}

      <p className="form-note">✅ 100% Free. No spam. Advisor calls in 5 minutes.</p>
    </form>
  );
}
