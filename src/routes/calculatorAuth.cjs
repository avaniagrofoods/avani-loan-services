// src/routes/calculatorAuth.cjs
// ─────────────────────────────────────────────────────────────────
// Server-Side Authentication & Session Controller for Calculator Suite
// Isolated & Password Protected via Environment Configuration
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.CALCULATOR_SESSION_SECRET || 'avani_default_calc_sec_key_2026_983742';
const COOKIE_NAME = 'avani_calc_session';
const SESSION_DURATION_HOURS = 8;

// Rate limiting: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Helper to extract a cookie from req.headers.cookie
 */
function getCookie(req, name) {
  const cookieHeader = req.headers && req.headers.cookie;
  if (!cookieHeader) return null;
  const matches = cookieHeader.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Helper to verify JWT token from cookie or Authorization header
 */
function verifySessionToken(req) {
  let token = getCookie(req, COOKIE_NAME);
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.scope === 'calculator_suite') {
      return decoded;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * POST /api/calculator-auth/login
 * Validates password server-side and issues HttpOnly session cookie
 */
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body || {};
  const expectedPassword = process.env.CALCULATOR_ACCESS_PASSWORD || 'Samarth@1356';

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  if (password !== expectedPassword) {
    return res.status(401).json({ success: false, message: 'Invalid password.' });
  }

  const token = jwt.sign(
    {
      scope: 'calculator_suite',
      issuedAt: Date.now()
    },
    JWT_SECRET,
    { expiresIn: `${SESSION_DURATION_HOURS}h` }
  );

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const cookieOptions = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_DURATION_HOURS * 3600}`
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieOptions.join('; '));
  return res.json({
    success: true,
    message: 'Access granted'
  });
});

/**
 * GET /api/calculator-auth/verify
 * Checks if current request has an active, valid server session
 */
router.get('/verify', (req, res) => {
  const session = verifySessionToken(req);
  if (session) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

/**
 * POST /api/calculator-auth/logout
 * Clears HttpOnly session cookie
 */
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const cookieOptions = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieOptions.join('; '));
  return res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
