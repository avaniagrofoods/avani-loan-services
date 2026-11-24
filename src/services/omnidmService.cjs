const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { syncToCrm } = require('./crmService.cjs');

// OmniDM Configuration (strictly environment-driven; zero hardcoded IDs or tokens)
const MARATHI_AGENT_ID = process.env.OMNIDIM_MARATHI_AGENT_ID || '';
const HINDI_AGENT_ID = process.env.OMNIDIM_HINDI_AGENT_ID || '';
const META_APP_ID = process.env.META_APP_ID || '';

function timingSafeCompare(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function getConfiguredVerifyToken() {
  return String(process.env.OMNIDM_VERIFY_TOKEN || process.env.OMNIDIM_VERIFY_TOKEN || '').trim();
}

/**
 * Handle incoming webhook from OmniDM (fail-closed authentication + zero PII logging)
 */
router.post('/webhook', async (req, res) => {
  try {
    const verifyToken = getConfiguredVerifyToken();
    if (!verifyToken || verifyToken.length < 16) {
      return res.status(503).json({ error: 'OMNIDM_WEBHOOK_NOT_CONFIGURED' });
    }

    const authHeader = String(req.headers['authorization'] || '');
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const providedToken = String(req.headers['x-omnidim-token'] || req.headers['x-verify-token'] || bearerToken || '').trim();
    if (!providedToken || !timingSafeCompare(providedToken, verifyToken)) {
      return res.status(401).json({ error: 'UNAUTHORIZED_OMNIDM_WEBHOOK' });
    }

    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const status = String(payload.callStatus || 'unknown');

    // Log strictly non-PII status metadata only
    console.log(`[OmniDM] Webhook event processed (status=${status}).`);

    if (status === 'completed' || status === 'ended') {
      await syncToCrm({
        name: payload.callerName || 'AI Caller',
        phone: payload.callerPhone || '',
        source: 'OmniDM Voice Agent',
        campaign: 'Inbound Calling',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('[OmniDM] Webhook Error:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Endpoint to verify webhook setup (fail-closed + timing-safe compare)
 */
router.get('/webhook', (req, res) => {
  const verifyToken = getConfiguredVerifyToken();
  if (!verifyToken || verifyToken.length < 16) {
    return res.sendStatus(503);
  }

  const mode = String(req.query['hub.mode'] || '');
  const token = String(req.query['hub.verify_token'] || '');
  const challenge = String(req.query['hub.challenge'] || '');

  if (mode && token) {
    if (mode === 'subscribe' && timingSafeCompare(token, verifyToken)) {
      console.log('[OmniDM] Webhook verified.');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

module.exports = router;
