import { Link } from 'react-router-dom';
import { Shield, Clock, Award, TrendingUp, Star, Users, CheckCircle, ArrowRight } from 'lucide-react';
import LeadForm from '../components/LeadForm';
import './Home.css';

// Import Images
import personalImg from '../assets/personal-loan.png';
import businessImg from '../assets/business-loan.png';
import educationImg from '../assets/education-loan.png';
import homeImg from '../assets/home-loan.png';
import mortgageImg from '../assets/mortgage-loan.png';
import cibilBanner from '../assets/cibil-banner.png';

const loanCards = [
  { image: personalImg, title: 'Salary Loan', desc: 'Fast personal loans for salaried employees up to ₹50L', rate: '10.5% p.a.' },
  { image: businessImg, title: 'Business Loan', desc: 'Grow your business with unsecured loans up to ₹2Cr', rate: '12% p.a.' },
  { image: educationImg, title: 'Education Loan', desc: 'Study in India or abroad with loans up to ₹1.5Cr', rate: '8.15% p.a.' },
  { image: homeImg, title: 'Home Loan', desc: 'Realize your dream home with low EMIs for 30 years', rate: '8.5% p.a.' },
  { image: mortgageImg, title: 'Mortgage / LAP', desc: 'Unlock your property value with Loan Against Property', rate: '9% p.a.' },
];

const trustBadges = [
  { icon: <Shield size={32} />, label: 'RBI Compliant DSA' },
  { icon: <Clock size={32} />, label: '48-Hour Approval' },
  { icon: <Award size={32} />, label: '10+ Banks Tied Up' },
  { icon: <Users size={32} />, label: '500+ Happy Clients' },
];

const testimonials = [
  { name: 'Ramesh K.', loan: 'Business Loan – ₹25L', text: 'Got my business loan approved in just 2 days. Excellent service by Avani team!' },
  { name: 'Priya M.', loan: 'Education Loan – ₹15L', text: 'Helped me secure abroad education loan. Very professional and transparent process.' },
  { name: 'Sunil P.', loan: 'Home Loan – ₹40L', text: 'Best interest rate I found in Latur. Smooth documentation, highly recommended!' },
];

export default function Home() {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-in">
            <span className="badge">📍 Trusted in Latur, Maharashtra</span>
            <h1 className="hero-title">Get Your Loan <br /><span className="hero-highlight">Approved in 48 Hours</span><br />in Latur</h1>
            <p className="hero-subtitle">Salary, Business, Education, Home & Mortgage Loans across all Maharashtra. No hidden charges. Free consultation.</p>
            <div className="hero-ctas">
              <Link to="/contact" className="btn btn-secondary hero-btn">Apply Now →</Link>
              <Link to="/eligibility" className="btn btn-outline-white hero-btn">Check Eligibility</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">500+</span><span>Happy Clients</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">48hrs</span><span>Avg Approval</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">10+</span><span>Bank Partners</span></div>
            </div>
          </div>
          <div className="hero-form animate-fade-in animate-delay-2">
            <LeadForm compact={true} />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section section-bg">
        <div className="container">
          <div className="trust-grid">
            {trustBadges.map((b, i) => (
              <div key={i} className="trust-badge">
                <span className="trust-icon">{b.icon}</span>
                <span className="trust-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="section">
        <div className="container">
          <span className="badge animate-fade-in">Our Services</span>
          <h2 className="section-title">Loan Products We Offer</h2>
          <p className="section-subtitle">Tailored financial solutions for every need — unsecured and secured loans at competitive rates.</p>
          <div className="loans-grid">
            {loanCards.map((loan, i) => (
              <div key={i} className="loan-card glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="loan-card-img-wrapper">
                  <img src={loan.image} alt={loan.title} className="loan-card-img" />
                </div>
                <h3 className="loan-title">{loan.title}</h3>
                <p className="loan-desc">{loan.desc}</p>
                <div className="loan-rate">Starting @ <strong>{loan.rate}</strong></div>
                <Link to="/contact" className="btn btn-primary loan-cta">Apply for {loan.title} <ArrowRight size={16} /></Link>
              </div>
            ))}
          </div>

          {/* CIBIL Correction Section */}
          <div className="cibil-section glass-card animate-fade-in" style={{ marginTop: 60 }}>
            <div className="cibil-grid">
              <div className="cibil-image-content">
                <img src={cibilBanner} alt="CIBIL Correction" className="cibil-img" />
              </div>
              <div className="cibil-text-content">
                <span className="badge badge-error">CIBIL Correction Services</span>
                <h3>Need a Loan but have a Low Score?</h3>
                <p className="cibil-message">
                  "Do you or someone you know is in need of a loan but has a low score? 
                  📲 <strong>Chat with me – I am ready to help find a solution!</strong>"
                </p>
                <div className="cibil-contact-details">
                  <p><strong>AVANI LOAN SERVICE LATUR</strong></p>
                  <p>MAHARASHTRA INDIA</p>
                  <p>📞 7249108474 | 📧 starpowerzlatur2210@gmail.com</p>
                </div>
                <div className="cibil-ctas">
                  <a href="https://b2c.creditsamadhaan.com/?refer_code=FY665935" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Fix CIBIL Score Now
                  </a>
                  <a href="https://wa.me/917249108474" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: 40 }}>
            <Link to="/loans" className="btn btn-outline">View All Loan Products</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section section section-bg">
        <div className="container">
          <span className="badge">Why Us?</span>
          <h2 className="section-title">Why Choose Avani Loan Services?</h2>
          <div className="grid grid-3">
            {[
              { icon: <TrendingUp size={36} />, title: 'Best Interest Rates', desc: 'We compare rates across 10+ banks to get you the lowest EMI possible.' },
              { icon: <Clock size={36} />, title: 'Fast Processing', desc: 'Pre-approval in just 48 hours. Minimal documentation required.' },
              { icon: <CheckCircle size={36} />, title: 'Transparent Process', desc: 'No hidden charges. We explain every step before you sign anything.' },
              { icon: <Users size={36} />, title: 'Dedicated Advisor', desc: 'Your personal loan advisor guides you from application to disbursement.' },
              { icon: <Shield size={36} />, title: 'RBI Compliant', desc: 'Fully registered DSA partner working with all major nationalized banks.' },
              { icon: <Award size={36} />, title: 'All Maharashtra', desc: 'Serving clients in Latur, Mumbai, Pune, Aurangabad and beyond.' },
            ].map((item, i) => (
              <div key={i} className="feature-card glass-card animate-fade-in">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <span className="badge">Client Stories</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="grid grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card glass-card animate-fade-in">
                <div className="stars">{[...Array(5)].map((_, s) => <Star key={s} size={16} fill="#e8a317" stroke="none" />)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-footer">
                  <strong>{t.name}</strong>
                  <span className="loan-tag">{t.loan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container text-center">
          <h2>Ready to Apply? Get Free Consultation Today!</h2>
          <p>Our expert advisors in Latur will guide you through the best loan options available.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-secondary">Apply Now</Link>
            <a href="https://wa.me/917249108474" target="_blank" rel="noopener noreferrer" className="btn btn-outline-white">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
