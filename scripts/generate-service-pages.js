#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { BLOG_ARTICLES } from '../src/data/blogArticles.js';

const root = process.cwd();
const dataPath = path.join(root, 'src', 'data', 'services.json');
const outRoot = path.join(root, 'public', 'services');
const publicRoot = path.join(root, 'public');

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  const raw = await fs.readFile(dataPath, 'utf8');
  const services = JSON.parse(raw);
  await fs.mkdir(outRoot, { recursive: true });
  await fs.mkdir(publicRoot, { recursive: true });

  const base = (process.env.SITE_URL || 'https://www.avanifinserv.com').replace(/\/$/, '');

  for (const s of services) {
    const dir = path.join(outRoot, s.slug);
    await fs.mkdir(dir, { recursive: true });
    const canonical = `${base}/services/${s.slug}`;
    const ogImageUrl = s.ogImage ? `${base}/${s.ogImage.replace(/^\/+/, '')}` : `${base}/og-default.svg`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.h1,
      serviceType: 'Financial Services / Loan Consultancy',
      description: s.metaDescription || '',
      url: canonical,
      provider: {
        '@type': 'FinancialService',
        name: 'AVANI LOAN SERVICES',
        url: base,
        telephone: '+919175635165',
        email: 'enquiry@avanifinserv.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'OLD BARSHI ROAD, 5NO CHAUK, KULSWAMINI NAGAR, NEXT TO SAI SCHOOL',
          addressLocality: 'Latur',
          addressRegion: 'Maharashtra',
          postalCode: '413512',
          addressCountry: 'IN'
        }
      }
    };

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(s.title)}</title>
  <meta name="description" content="${escapeHtml(s.metaDescription || '')}" />
  <meta property="og:title" content="${escapeHtml(s.title)}" />
  <meta property="og:description" content="${escapeHtml(s.metaDescription || '')}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index,follow" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <header>
    <a href="/">AVANI LOAN SERVICES</a>
  </header>
  <main>
    <h1>${escapeHtml(s.h1)}</h1>
    ${s.content || ''}
    <p><a href="/services">All 8 Loan Advisory Services</a> | <a href="/contact">Contact Advisor</a> | <a href="/">Home</a></p>
  </main>
  <footer>
    <small>&copy; ${new Date().getFullYear()} AVANI LOAN SERVICES — OLD BARSHI ROAD, 5NO CHAUK, KULSWAMINI NAGAR, NEXT TO SAI SCHOOL, LATUR – 413512, MAHARASHTRA, INDIA</small>
  </footer>
</body>
</html>`;

    await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
  }

  // Generate clean canonical sitemap.xml (ONLY intended public URLs; zero admin, zero broken links)
  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapItems = [
    { loc: `${base}/`, lastmod, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/services`, lastmod, changefreq: 'weekly', priority: '0.9' }
  ];

  for (const s of services) {
    sitemapItems.push({ loc: `${base}/services/${s.slug}`, lastmod, changefreq: 'weekly', priority: '0.85' });
  }

  sitemapItems.push({ loc: `${base}/blog`, lastmod, changefreq: 'weekly', priority: '0.8' });
  for (const art of BLOG_ARTICLES) {
    sitemapItems.push({ loc: `${base}/blog/${art.slug}`, lastmod: art.date || lastmod, changefreq: 'monthly', priority: '0.75' });
  }

  const extraPublicPages = [
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
    { path: '/loans', priority: '0.8', changefreq: 'monthly' },
    { path: '/eligibility', priority: '0.75', changefreq: 'monthly' },
    { path: '/documents', priority: '0.75', changefreq: 'monthly' },
    { path: '/cibil-check', priority: '0.75', changefreq: 'monthly' },
    { path: '/financial-tools', priority: '0.8', changefreq: 'monthly' },
    { path: '/financial-tools/loan/emi', priority: '0.75', changefreq: 'monthly' },
    { path: '/financial-tools/loan/foir-eligibility', priority: '0.75', changefreq: 'monthly' },
    { path: '/builder-partnership', priority: '0.7', changefreq: 'monthly' },
    { path: '/institutional-funding', priority: '0.7', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    { path: '/disclaimer', priority: '0.5', changefreq: 'yearly' }
  ];

  for (const p of extraPublicPages) {
    sitemapItems.push({ loc: `${base}${p.path}`, lastmod, changefreq: p.changefreq, priority: p.priority });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapItems
    .map(
      (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  // Write identical sitemap.xml and robots.txt to BOTH public/ and root to eliminate historical conflict
  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /admin-eligibility\nDisallow: /api/\nDisallow: /financial-tools/admin\nDisallow: /financial-tools/login\nDisallow: /calculators/admin\nDisallow: /calculators/login\nSitemap: ${base}/sitemap.xml\n`;

  await fs.writeFile(path.join(publicRoot, 'sitemap.xml'), sitemapXml, 'utf8');
  await fs.writeFile(path.join(root, 'sitemap.xml'), sitemapXml, 'utf8');
  await fs.writeFile(path.join(publicRoot, 'robots.txt'), robotsTxt, 'utf8');
  await fs.writeFile(path.join(root, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`Generated ${services.length} official service pages, ${sitemapItems.length} canonical sitemap URLs, and unified robots.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
