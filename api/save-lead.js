import twilio from 'twilio';
import axios from 'axios';

// Vercel Serverless Function: POST /api/save-lead
// Pipeline: Website Form → Google Apps Script (Sheets + HubSpot) → Twilio WhatsApp
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const leadData = {
      ...req.body,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: req.body.source || 'Website_Avani_Form'
    };

    console.log('Lead Received:', leadData.name, leadData.phone, leadData.loanType);

    const syncResults = {
      sheets: false,
      hubspot: false,
      whatsapp: false
    };

    // ── 1. Google Apps Script (handles Sheets + HubSpot internally) ──
    if (process.env.GOOGLE_SHEET_APP_SCRIPT_URL) {
      try {
        const sheetsPayload = {
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email || '',
          loanType: leadData.loanType || '',
          amount: leadData.amount || '',
          city: leadData.city || '',
          source: leadData.source,
          timestamp: leadData.timestamp,
          id: leadData.id
        };
        await axios.post(process.env.GOOGLE_SHEET_APP_SCRIPT_URL, sheetsPayload, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        syncResults.sheets = true;
      } catch (err) {
        console.error('Google Sheets Error:', err.message);
      }
    }

    // ── 2. HubSpot CRM (direct API — no Make.com needed) ──
    const hubspotPortalId = process.env.HUBSPOT_PORTAL_ID || '244236573';
    const hubspotFormId   = process.env.HUBSPOT_FORM_ID   || 'edde042c-3451-420a-a472-6a5c42cbdf98';
    if (leadData.email || leadData.phone) {
      try {
        await axios.post(
          `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormId}`,
          {
            fields: [
              { name: 'firstname', value: leadData.name || '' },
              { name: 'email',     value: leadData.email || 'noemail@avanifinserv.com' },
              { name: 'phone',     value: leadData.phone || '' },
              { name: 'loan_type__c', value: leadData.loanType || '' },
              { name: 'message',   value: `Loan Amount: ${leadData.amount || 'Not specified'} | City: ${leadData.city || 'Not specified'} | Source: ${leadData.source}` }
            ],
            context: {
              pageUri: 'https://www.avanifinserv.com',
              pageName: 'Avani Loan Services - Lead Form'
            }
          },
          { timeout: 8000, headers: { 'Content-Type': 'application/json' } }
        );
        syncResults.hubspot = true;
      } catch (err) {
        console.error('HubSpot Error:', err.message);
      }
    }

    // ── 3. Twilio WhatsApp Notification to Business Owner ──
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER &&
      leadData.phone
    ) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Notify customer
        await client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to:   `whatsapp:${leadData.phone}`,
          body: `🙏 नमस्कार ${leadData.name}!\n\nAvani Loan Services में आपका स्वागत है।\n\nहमें आपकी ${leadData.loanType ? leadData.loanType.toUpperCase() : 'LOAN'} enquiry मिल गई है।\n\nहमारी टीम 30 मिनट में आपसे संपर्क करेगी।\n\n📞 +91 7249108474\n🌐 www.avanifinserv.com`
        });
        syncResults.whatsapp = true;
      } catch (err) {
        console.error('Twilio Error:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Lead processed successfully',
      lead: { name: leadData.name, phone: leadData.phone, loanType: leadData.loanType },
      syncResults
    });

  } catch (error) {
    console.error('Global Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
