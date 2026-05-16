import axios from 'axios';

// Vercel Serverless Function: POST /api/vapi-callback
// Handles VAPI AI call completion — logs to Google Sheets directly (no Make.com)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const webhookData = req.body;
    console.log('VAPI Callback Received:', webhookData.callId);

    const callData = {
      callId:      webhookData.callId || '',
      phoneNumber: webhookData.customerNumber || webhookData.to || '',
      status:      webhookData.callStatus || webhookData.status || 'completed',
      duration:    webhookData.duration || 0,
      transcript:  webhookData.transcript || '',
      summary:     webhookData.summary || '',
      timestamp:   new Date().toISOString(),
      source:      'VAPI_AI_Call'
    };

    // ── Sync call data to Google Sheets (direct, no Make.com) ──
    if (process.env.GOOGLE_SHEET_APP_SCRIPT_URL) {
      try {
        await axios.post(process.env.GOOGLE_SHEET_APP_SCRIPT_URL, callData, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Call data synced to Google Sheets');
      } catch (err) {
        console.error('Sheets Sync Error:', err.message);
      }
    }

    // ── Update HubSpot contact with call outcome ──
    const hubspotPortalId = process.env.HUBSPOT_PORTAL_ID || '244236573';
    const hubspotFormId   = process.env.HUBSPOT_FORM_ID   || 'edde042c-3451-420a-a472-6a5c42cbdf98';
    if (callData.phoneNumber) {
      try {
        await axios.post(
          `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormId}`,
          {
            fields: [
              { name: 'phone',   value: callData.phoneNumber },
              { name: 'email',   value: 'noemail@avanifinserv.com' },
              { name: 'firstname', value: 'AI Call Lead' },
              { name: 'message', value: `AI Call ID: ${callData.callId} | Status: ${callData.status} | Duration: ${callData.duration}s | Summary: ${callData.summary}` }
            ],
            context: {
              pageUri: 'https://www.avanifinserv.com',
              pageName: 'Avani Loan - VAPI AI Call'
            }
          },
          { timeout: 8000 }
        );
        console.log('HubSpot updated with call data');
      } catch (err) {
        console.error('HubSpot Update Error:', err.message);
      }
    }

    return res.status(200).json({ success: true, callId: callData.callId });

  } catch (error) {
    console.error('VAPI Callback Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
