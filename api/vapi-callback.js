import axios from 'axios';
import crypto from 'crypto';

function timingSafeCompare(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Vercel Serverless Function: POST /api/vapi-callback
// Fail-closed webhook receiver; zero hardcoded third-party webhook URLs.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const expectedSecret = String(process.env.VAPI_WEBHOOK_SECRET || '').trim();
  if (!expectedSecret || expectedSecret.length < 16) {
    return res.status(503).json({
      success: false,
      code: 'WEBHOOK_NOT_CONFIGURED',
      error: 'Vapi webhook receiver is disabled or unconfigured.'
    });
  }

  const authHeader = String(req.headers['authorization'] || '');
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const providedSecret = String(req.headers['x-vapi-secret'] || bearerToken || '').trim();
  if (!providedSecret || !timingSafeCompare(providedSecret, expectedSecret)) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED_WEBHOOK',
      error: 'Invalid or missing webhook authentication secret.'
    });
  }

  try {
    const webhookData = req.body && typeof req.body === 'object' ? req.body : {};

    const callData = {
      callId:       String(webhookData.callId || ''),
      phoneNumber:  String(webhookData.customerNumber || ''),
      status:       String(webhookData.callStatus || 'completed'),
      duration:     Number(webhookData.duration || 0) || 0,
      transcript:   String(webhookData.transcript || ''),
      summary:      String(webhookData.summary || ''),
      timestamp:    new Date().toISOString(),
      businessName: 'AVANI LOAN SERVICES',
      source:       'VAPI_AI_Call'
    };

    // 1. Optional Pabbly Connect forwarding (strictly environment-configured; zero hardcoded URLs)
    const pabblyUrl = String(process.env.PABBLY_CONNECT_URL || '').trim();
    if (pabblyUrl) {
      try {
        await axios.post(pabblyUrl, callData, { timeout: 8000 });
      } catch (err) {
        console.error('[VapiCallback] Pabbly Connect forwarding failed:', err.message);
      }
    }

    // 2. Optional Google Sheets backup forwarding (strictly environment-configured)
    const sheetsUrl = String(process.env.GOOGLE_SHEET_APP_SCRIPT_URL || '').trim();
    if (sheetsUrl) {
      try {
        await axios.post(sheetsUrl, callData, { timeout: 8000 });
      } catch (err) {
        console.error('[VapiCallback] Sheets forwarding failed:', err.message);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[VapiCallback] Processing error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal processing error.' });
  }
}
