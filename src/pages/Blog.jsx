import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';
import personalImg from '../assets/optimized/personal-loan.webp';
import businessImg from '../assets/optimized/business-loan.webp';
import educationImg from '../assets/optimized/education-loan.webp';
import homeImg from '../assets/optimized/home-loan.webp';
import mortgageImg from '../assets/optimized/mortgage-loan.webp';
import cibilBanner from '../assets/optimized/avani_cibil_banner.webp';
import './Blog.css';

const IMAGE_MAP = {
  personal: personalImg,
  business: businessImg,
  education: educationImg,
  home: homeImg,
  mortgage: mortgageImg,
  cibil: cibilBanner
};

export default function Blog() {
  useSEO({
    title: 'Loan Advisory Guides & Financial Literacy Blog | Avani Loan Services',
    description:
      'Educational guides on Personal, Business, Home, Mortgage, Education (India & Global), and School & College Funding in Latur & Maharashtra.',
    keywords: 'Loan advisory blog, financial literacy Maharashtra, Home loan guide Latur, School funding guide, Avani Loan Services'
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(BLOG_ARTICLES.map((a) => a.category)))];
  const visibleArticles =
    selectedCategory === 'All'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <div className="blog-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">Financial Literacy &amp; Advisory Guides</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <h1>Loan Advisory Guides &amp; Educational Articles</h1>
          <p>Practical documentation and planning guides prepared by {OFFICIAL_BUSINESS.name} for borrowers and institutions in Maharashtra.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '26px' }} role="group" aria-label="Filter articles by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 14px', fontSize: '0.88rem' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {visibleArticles.map((post) => (
              <article key={post.slug} className="blog-card glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                <div>
                  <img
                    src={IMAGE_MAP[post.imageKey] || educationImg}
                    alt={post.title}
                    width="400"
                    height="220"
                    loading="lazy"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                      <Tag size={13} aria-hidden="true" /> {post.category}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} aria-hidden="true" /> {post.readTime}
                    </span>
                    <span>{post.date}</span>
                  </div>
                  <h2 style={{ fontSize: '1.18rem', color: 'var(--primary-deep)', marginBottom: '10px' }}>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-light)', marginBottom: '14px' }}>{post.summary}</p>
                </div>

                <Link to={`/blog/${post.slug}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  <BookOpen size={15} aria-hidden="true" /> Read Full Guide <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div className="glass-card" style={{ marginTop: '32px', background: 'var(--secondary-soft)', border: '1px solid #fcd34d', color: '#78350f', fontSize: '0.88rem' }}>
            <strong>Educational Notice:</strong> Articles on this site are for general borrower education only and do not guarantee loan approval, interest rates, or credit score changes. Office: {OFFICIAL_BUSINESS.fullAddress}.
          </div>
        </div>
      </section>
    </div>
  );
}
