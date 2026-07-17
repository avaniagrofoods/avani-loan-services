import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncLeadData } from '../lib/syncLeads';

export default function SimpleLeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    loanType: 'Personal Loan',
    amount: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Unified Sync to Sheets, Make.com, and Backend
      await syncLeadData({
        ...formData,
        source: 'Website_Contact_Form'
      });

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', loanType: 'Personal Loan', amount: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="form-success-card animate-fade-in" style={{ textAlign: 'center', padding: '40px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
        <CheckCircle2 size={64} color="#16a34a" style={{ margin: '0 auto 20px' }} />
        <h3 style={{ color: '#166534', marginBottom: '10px' }}>Application Received!</h3>
        <p style={{ color: '#15803d' }}>Thank you, {formData.name}. Our loan expert will call you on {formData.phone} within 5 minutes for your free consultation.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
          <a href={`https://wa.me/919175635165?text=Hi, I submitted an inquiry on your website for a ${formData.loanType}. My name is ${formData.name} and my phone number is ${formData.phone}.`} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#25D366', color: '#fff', width: '100%', justifyContent: 'center' }}>Chat on WhatsApp Now</a>
          <button onClick={() => setStatus('idle')} className="btn" style={{ background: 'transparent', border: '1px solid #16a34a', color: '#16a34a', width: '100%', justifyContent: 'center' }}>Send Another Inquiry</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="simple-contact-form glass-card" style={{ padding: '30px', background: '#fff' }}>
      <div style={{ marginBottom: '20px' }}>
        <label className="input-label">Full Name *</label>
        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label className="input-label">Mobile Number *</label>
          <input type="tel" name="phone" required pattern="[0-9]{10}" value={formData.phone} onChange={handleChange} className="form-input" placeholder="10-digit mobile number" />
        </div>
        <div>
          <label className="input-label">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Your email (optional)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label className="input-label">Loan Type</label>
          <select name="loanType" value={formData.loanType} onChange={handleChange} className="form-input">
            <option>Personal Loan</option>
            <option>Business Loan</option>
            <option>Home Loan</option>
            <option>Education Loan</option>
            <option>Mortgage Loan</option>
            <option>CIBIL Correction</option>
          </select>
        </div>
        <div>
          <label className="input-label">Required Amount (₹)</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-input" placeholder="Expected loan amount" />
        </div>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label className="input-label">How can we help you?</label>
        <textarea name="message" value={formData.message} onChange={handleChange} className="form-input" rows="3" placeholder="Tell us about your requirement..."></textarea>
      </div>

      {status === 'error' && (
        <div style={{ marginBottom: '20px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>Something went wrong. Please try again or call us directly.</span>
        </div>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }}>
        {status === 'loading' ? 'Submitting...' : 'Apply Now & Get Call Back'} <Send size={18} style={{ marginLeft: '10px' }} />
      </button>
      
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '15px' }}>
        🔒 Your data is secure. By clicking, you agree to be contacted for loan services.
      </p>
    </form>
  );
}
