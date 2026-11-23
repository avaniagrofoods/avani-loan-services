import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Tag, User, Phone, MessageCircle } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';
import { generateWhatsAppDocumentLink, TEL_HREF, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/optimized/avani-brand-logo.webp';

export default function BlogDetail() {
  const { slug } = useParams();
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  useSEO({
    title: article ? `${article.title} | Avani Loan Services` : 'Article Not Found | Avani Loan Services',
    description: article ? article.summary : 'Educational loan advisory guides from AVANI LOAN SERVICES.',
    canonical: article ? `${OFFICIAL_BUSINESS.websiteUrl}/blog/${article.slug}` : undefined,
    noindex: !article
  });

  useEffect(() => {
    if (!article) return undefined;
    const existing = document.getElementById('article-json-ld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-json-ld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.summary,
      datePublished: article.date,
      author: {
        '@type': 'Person',
        name: OFFICIAL_BUSINESS.owner
      },
      publisher: {
        '@type': 'Organization',
        name: OFFICIAL_BUSINESS.name,
        url: OFFICIAL_BUSINESS.websiteUrl
      },
      mainEntityOfPage: `${OFFICIAL_BUSINESS.websiteUrl}/blog/${article.slug}`
    });
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('article-json-ld');
      if (el) el.remove();
    };
  }, [article]);

  if (!article) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: '720px', textAlign: 'center' }}>
          <h1>Article Not Found</h1>
          <p style={{ margin: '14px 0 22px', color: 'var(--text-light)' }}>
            The requested educational guide could not be found.
          </p>
          <Link to="/blog" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden="true" /> Back to All Guides
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="blog-detail-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services Logo" className="page-header-logo" width="56" height="56" />
            <div>
              <span className="badge">{article.category}</span>
              <div className="page-header-address">{OFFICIAL_BUSINESS.shortAddress}</div>
            </div>
          </div>
          <nav aria-label="Breadcrumb" style={{ marginBottom: '10px', fontSize: '0.88rem' }}>
            <Link to="/" style={{ textDecoration: 'underline' }}>Home</Link> /{' '}
            <Link to="/blog" style={{ textDecoration: 'underline' }}>Blog</Link> /{' '}
            <span>{article.category}</span>
          </nav>
          <h1>{article.title}</h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px', fontSize: '0.9rem', opacity: 0.92 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><User size={15} aria-hidden="true" /> {article.author}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Tag size={15} aria-hidden="true" /> {article.category}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Clock size={15} aria-hidden="true" /> {article.readTime} ({article.date})</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <article className="glass-card" style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '22px', fontWeight: 500 }}>
              {article.summary}
            </p>
            {article.sections.map((sec) => (
              <div key={sec.heading} style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '8px' }}>{sec.heading}</h2>
                <p style={{ color: 'var(--text-dark)', lineHeight: 1.7 }}>{sec.body}</p>
              </div>
            ))}

            <div
              style={{
                marginTop: '24px',
                padding: '14px 16px',
                borderRadius: '8px',
                background: 'var(--secondary-soft)',
                border: '1px solid #fcd34d',
                color: '#78350f',
                fontSize: '0.88rem'
              }}
            >
              <strong>Advisory Disclaimer:</strong> {OFFICIAL_BUSINESS.advisoryDisclosure}
            </div>
          </article>

          <div className="glass-card" style={{ background: 'var(--primary-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--primary-deep)', marginBottom: '4px' }}>Need Personalized Documentation Guidance?</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>Speak with {OFFICIAL_BUSINESS.name} during office hours.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Contact Advisor <ArrowRight size={15} aria-hidden="true" /></Link>
              <a href={generateWhatsAppDocumentLink(article.category)} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#15803d', color: '#ffffff' }}>
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp
              </a>
              <a href={TEL_HREF} className="btn btn-outline"><Phone size={15} aria-hidden="true" /> {DISPLAY_PHONE}</a>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Link to="/blog" className="btn btn-outline">
              <ArrowLeft size={16} aria-hidden="true" /> Back to All Advisory Guides
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
