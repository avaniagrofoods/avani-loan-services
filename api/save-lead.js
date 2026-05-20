import twilio from 'twilio';
import axios from 'axios';

// Vercel Serverless Function: POST /api/save-lead
// Integrated with Pabbly, Google Web App, and PICKY ASSIST
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const PABBLY_CONNECT_URL = "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjIwNTY0MDYzMDA0M2Q1MjY4NTUzNCI_3D_pc/IjU3NjcwNTZlMDYzMDA0MzU1MjZhNTUzYzUxMzIi_pc";
    const PICKY_ASSIST_URL = "https://app.pickyassist.com/url/5cb2564f744736ff1b4d09e1ebad26748625043e";
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx_BiUDUesN9WC4OK-5eznfKOVqfHS-55enFvWni58dVHVUm08HjIqkFIcVUTnWCKxLXg/exec";
    
    const BUSINESS_DETAILS = {
      businessName: "AVANI LOAN SERVICE",
      address: "RAJIV GANDHI CHAUK, OPP BANK OF BARODA, ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD, LATUR-413512",
      supportPhone: "+91 9175635165",
      email: "ENQUIRY@AVANIFINSERV.COM",
      website: "https://www.avanifinserv.com"
    };

    const leadData = {
      ...req.body,
      ...BUSINESS_DETAILS,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: req.body.source || 'Website_Avani_Form'
    };

    const syncResults = {
      pabbly: false,
      pickyAssist: false,
      googleWebApp: false
    };

    // ── 1. Picky Assist (WhatsApp Automation) ──
    try {
      await axios.post(PICKY_ASSIST_URL, leadData, { timeout: 10000 });
      syncResults.pickyAssist = true;
    } catch (err) { console.error('Picky Assist Error:', err.message); }

    // ── 2. Google Web App (Lead Scorer) ──
    try {
      await axios.post(GOOGLE_WEB_APP_URL, leadData, { timeout: 10000 });
      syncResults.googleWebApp = true;
    } catch (err) { console.error('Google Web App Error:', err.message); }

    // ── 3. Pabbly Connect ──
    try {
      await axios.post(PABBLY_CONNECT_URL, leadData, { timeout: 10000 });
      syncResults.pabbly = true;
    } catch (err) { console.error('Pabbly Connect Error:', err.message); }

    return res.status(200).json({ success: true, syncResults });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
