import { useEffect } from 'react';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';

const NOINDEX_PREFIXES = [
  '/admin',
  '/admin-eligibility',
  '/ai-assistant',
  '/templates',
  '/campaigns',
  '/financial-tools/admin',
  '/financial-tools/login',
  '/calculators/login',
  '/calculators/admin',
  '/calculator-admin',
  '/loan-documents/'
];

function computeCanonicalUrl(customCanonical) {
  const base = OFFICIAL_BUSINESS.websiteUrl.replace(/\/$/, '');
  if (customCanonical) {
    if (/^https?:\/\//i.test(customCanonical)) return customCanonical;
    return `${base}${customCanonical.startsWith('/') ? customCanonical : `/${customCanonical}`}`;
  }
  if (typeof window === 'undefined') return `${base}/`;
  let pathname = window.location.pathname || '/';
  // Canonicalize legacy /calculators/* aliases to /financial-tools/*
  if (pathname === '/calculators' || pathname === '/calculators/') {
    pathname = '/financial-tools';
  } else if (pathname.startsWith('/calculators/')) {
    pathname = pathname.replace(/^\/calculators\//, '/financial-tools/');
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return `${base}${pathname}`;
}

export default function useSEO({ title, description, keywords, canonical, noindex = false }) {
  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const shouldNoIndex =
      Boolean(noindex) || NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (title) {
      const hasBrand = /avani\s+loan\s+services/i.test(title);
      document.title = hasBrand ? title : `${title} | Avani Loan Services`;
    }

    const setMeta = (name, content) => {
      if (!content) return;
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setProperty = (property, content) => {
      if (!content) return;
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const canonicalHref = computeCanonicalUrl(canonical);
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalHref;

    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('robots', shouldNoIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph & Twitter
    const finalTitle = document.title;
    setProperty('og:title', finalTitle);
    setProperty('og:description', description);
    setProperty('og:type', 'website');
    setProperty('og:url', canonicalHref);
    setProperty('og:site_name', OFFICIAL_BUSINESS.name);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', finalTitle);
    setMeta('twitter:description', description);
  }, [title, description, keywords, canonical, noindex]);
}
