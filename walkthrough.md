# Avani Loan Services Website — Walkthrough

## What Was Built

A complete 8-page professional Vite + React website for **Avani Loan Services**, Latur, Maharashtra.

## Tech Stack
- **Framework**: Vite + React (SPA)
- **Styling**: Vanilla CSS with premium glassmorphism, gradients, and micro-animations
- **Routing**: react-router-dom
- **Icons**: lucide-react (with inline SVG fallbacks)
- **Fonts**: Inter (Google Fonts)
- **Deployment target**: Vercel

---

## Pages Built

| Page | Route | Status |
|---|---|---|
| Home | `/` | ✅ Done |
| About Us | `/about` | ✅ Done |
| Loan Products | `/loans` | ✅ Done |
| Eligibility / EMI Calculator | `/eligibility` | ✅ Done |
| Documents Required | `/documents` | ✅ Done |
| Blog & Tips | `/blog` | ✅ Done |
| Contact / Apply | `/contact` | ✅ Done |
| Privacy Policy | `/privacy` | ✅ Done |

---

## Key Features

### 🎨 Design System
- Deep Trust Blue (`#0a4f8b`) + Gold (`#e8a317`) brand palette
- Glassmorphism cards with hover animations
- Responsive navbar with mobile hamburger menu
- Full-page footer with links and contact info
- WhatsApp Floating Action Button (green, always visible)
- Branded `A` favicon (SVG)
- Google Fonts Inter for premium typography

### Lead Forms & Zoho CRM
- `LeadForm.jsx` submits to Zoho CRM URL via `fetch` (no-cors mode)
- Captures: Name, Phone, Email, Loan Type, Amount, City
- On success → auto-opens pre-filled WhatsApp message to `+91-7249108474`
- Lead forms embedded on: Home page, About page, and Contact page

### EMI Calculator
- Live sliders: Amount (₹50K – ₹1Cr), Rate (7-30%), Tenure (6M – 30Y)
- Real-time EMI, total interest, total repayment calculations
- Principal vs. Interest bar chart visual
- "You Qualify" card with minimum income estimate

### Documents Page
- Accordion UI (expand/collapse) for each of 6 loan types
- Documents organized by category within each loan type

### Blog Page
- 10 SEO-targeted articles covering CIBIL, Home Loan, Education Loan, Business Loan, LAP, DSA tips
- Targeting keywords like "loan agent Latur", "CIBIL score kaise badhayein"

---

## Build Result
```
✓ Build successful in 1.60s
dist/assets/index.css   20.36 kB │ gzip: 4.73 kB
dist/assets/index.js   284.56 kB │ gzip: 89.07 kB
```

---

## Next Steps: Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial Avani Loan Services website"
   git remote add origin https://github.com/your-repo.git
   git push -u origin main
   ```

2. **Connect to Vercel:** Go to [vercel.com](https://vercel.com), import the GitHub repo, and click Deploy. No config changes needed — Vite is auto-detected.

3. **Zoho CRM Webhook:** To make form submissions fully land in Zoho, you'll need to:
   - Go to Zoho CRM → Settings → Connected Workflow
   - Create a Webform and get the POST action URL
   - Replace `ZOHO_URL` in `src/components/LeadForm.jsx`

![Website Preview Recording](file:///C:/Users/ALPHA-1/.gemini/antigravity/brain/44564bee-cd39-4e7e-9529-a9d281535f85/avani_loan_preview_1775816624562.webp)
