import { Link } from 'react-router-dom';
import './Blog.css';

const posts = [
  { id: 1, emoji: '📊', category: 'CIBIL', title: 'CIBIL Score Kaise Badhayein – 7 Proven Tips in 2025', date: 'March 20, 2025', readTime: '6 min read', desc: 'Your CIBIL score is the key to getting any loan in India. Here are 7 expert tips to improve your credit score from 600 to 750+ within 12 months.' },
  { id: 2, emoji: '🏠', title: 'Complete Guide to Home Loans in Maharashtra 2025', category: 'Home Loan', date: 'March 10, 2025', readTime: '8 min read', desc: 'Everything you need to know about home loans in Maharashtra — eligibility, documents, EMI calculation, and how to get the best rates.' },
  { id: 3, emoji: '✈️', title: 'How to Fund MBBS Abroad: Education Loans Explained', category: 'Education Loan', date: 'Feb 28, 2025', readTime: '7 min read', desc: 'Planning to study medicine abroad? Our complete guide covers education loans for MBBS in Russia, Philippines, Georgia, Ukraine and more.' },
  { id: 4, emoji: '💼', title: 'Business Loan vs Working Capital Loan – What\'s Right for You?', category: 'Business Loan', date: 'Feb 15, 2025', readTime: '5 min read', desc: 'Confused between a business term loan and working capital facility? This guide explains both with real examples from Maharashtra businesses.' },
  { id: 5, emoji: '🏦', title: 'LAP Loan in Latur: How to Get Best Loan Against Property', category: 'Mortgage', date: 'Feb 5, 2025', readTime: '6 min read', desc: 'Loan Against Property is one of the smartest ways to raise large funds at low interest. Here\'s a location-specific guide for Latur property owners.' },
  { id: 6, emoji: '💳', title: 'Personal Loan Rejection Reasons & How to Avoid Them', category: 'Personal Loan', date: 'Jan 28, 2025', readTime: '5 min read', desc: 'Getting rejected for a personal loan is frustrating. Here are the top 8 reasons banks reject applications and how you can fix them.' },
  { id: 7, emoji: '📋', title: 'PMAY Scheme for Home Loans: How to Get Government Subsidy', category: 'Home Loan', date: 'Jan 20, 2025', readTime: '7 min read', desc: 'The Pradhan Mantri Awas Yojana gives up to ₹2.67L subsidy on home loans. Complete guide to eligibility and how to apply in Maharashtra.' },
  { id: 8, emoji: '🎓', title: 'Education Loan for Engineering in India: Top Colleges Guide', category: 'Education Loan', date: 'Jan 10, 2025', readTime: '6 min read', desc: 'A comprehensive guide to education loans for IIT, NIT, private engineering colleges — EMI, moratorium, tax benefits explained.' },
  { id: 9, emoji: '📈', title: 'How to Calculate Your Loan Eligibility Before Applying', category: 'Tips', date: 'Dec 30, 2024', readTime: '4 min read', desc: 'Before you apply for any loan, calculate your eligibility. Banks allow max 50–60% of your income as EMI. Here\'s the full formula.' },
  { id: 10, emoji: '🤝', title: 'DSA vs Bank Direct: Which Way to Apply for a Loan?', category: 'Tips', date: 'Dec 20, 2024', readTime: '5 min read', desc: 'Should you apply for a loan via a DSA agent or directly at the bank? We break down the advantages of both approaches honestly.' },
];

export default function Blog() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="badge">Blog & Tips</span>
          <h1>Loan Tips, Guides & Financial Advice</h1>
          <p>Expert articles to help you make smarter financial decisions</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-grid">
            {posts.map(post => (
              <article key={post.id} className="blog-card glass-card animate-fade-in">
                <div className="blog-emoji">{post.emoji}</div>
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-separator">•</span>
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-separator">•</span>
                  <span className="blog-read">{post.readTime}</span>
                </div>
                <h2 className="blog-title">{post.title}</h2>
                <p className="blog-desc">{post.desc}</p>
                <Link to="/contact" className="blog-read-more">Read More & Get Free Advice →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-cta-section section">
        <div className="container text-center">
          <h2>Have a Loan Question?</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>Our advisors in Latur give free consultations. WhatsApp us now.</p>
          <a href="https://wa.me/917249108474" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">💬 WhatsApp for Free Advice</a>
        </div>
      </section>
    </div>
  );
}
