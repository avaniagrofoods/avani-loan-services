// src/services/aisensyAdapter.cjs
// ─────────────────────────────────────────────────────────────────
// AiSensy WABA WhatsApp Adapter
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');

function maskPhone(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.length <= 4) return '****';
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

/**
 * Send WABA WhatsApp Template Message via AiSensy
 */
async function sendWhatsAppTemplate({ destination, campaignName, templateParams = [], mediaUrl = null }) {
  const apiUrl = process.env.AISENSY_API_URL || 'https://backend.aisensy.com/campaign/t1/api/v2';
  const apiKey = String(process.env.AISENSY_API_KEY || '').trim();
  const maskedDest = maskPhone(destination);
  const isPlaceholder = !apiKey || /^(?:your_|placeholder|example|changeme)/i.test(apiKey);

  try {
    const cleanDest = String(destination || '').replace(/[^0-9]/g, '');
    if (!cleanDest || cleanDest.length < 10) {
      return { success: false, code: 'INVALID_DESTINATION', error: 'Valid destination phone is required.' };
    }

    if (process.env.PROVIDER_MODE === 'mock') {
      console.log(`[AiSensyAdapter Mock] WABA Message simulated for ${maskedDest}: Campaign ${campaignName}`);
      return {
        success: true,
        mock: true,
        campaignName,
        destinationMasked: maskedDest
      };
    }

    if (isPlaceholder) {
      console.warn(`[AiSensyAdapter] Blocked send for ${maskedDest}: AISENSY_API_KEY is not configured.`);
      return { success: false, code: 'AISENSY_NOT_CONFIGURED', error: 'AiSensy API key is not configured.' };
    }

    const payload = {
      apiKey,
      campaignName,
      destination: cleanDest,
      userName: templateParams[0] || 'Valued Customer',
      templateParams
    };

    if (mediaUrl) payload.media = { url: mediaUrl };

    const res = await axios.post(apiUrl, payload, { timeout: 10000 });
    console.log(`[AiSensyAdapter] Message sent successfully to ${maskedDest}: status=${res.status}`);
    return { success: true, status: res.status };
  } catch (err) {
    console.warn(`[AiSensyAdapter] Delivery failed for ${maskedDest} (non-fatal):`, err.message);
    return { success: false, error: 'AiSensy delivery failed.' };
  }
}

module.exports = {
  sendWhatsAppTemplate
};
