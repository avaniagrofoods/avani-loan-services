// src/routes/eligibility.cjs  (CommonJS – used by server.cjs & Vercel)
require('dotenv').config();
const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const axios    = require('axios');

const { parseDocuments }       = require('../utils/documentParser.cjs');
const { generateExcel }        = require('../utils/excelGenerator.cjs');
const { appendRowToGoogleSheet } = require('../utils/googleSheets.cjs');
const { syncToHubSpot }        = require('../utils/hubSpot.cjs');
const { processEligibility }    = require('../services/eligibilityEngine.cjs');
const { getCache, setCache } = require('../cache.cjs');
const { eligibilityQueue } = require('../queues/eligibilityQueue.cjs');
const rateLimit = require('express-rate-limit');

// Rate limiter for /calculate – 30 req/min per IP
const calculateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Rate limit exceeded – try again later' },
});
router.use('/calculate', calculateLimiter);


// ── Multer configuration ────────────────────────────────────────
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads/eligibility'
  : (process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'));

try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn('[eligibility] Could not create uploadDir (read-only FS?):', e.message);
}

const upload = multer({
  dest   : uploadDir,
  limits : { fileSize: (parseFloat(process.env.MAX_UPLOAD_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('UNSUPPORTED_TYPE'), { code: 'UNSUPPORTED_TYPE' }));
    }
  }
});

// ── POST /api/eligibility/process ──────────────────────────────
router.post('/process', upload.array('files', 20), async (req, res) => {
  try {
    const { password } = req.body;

    // ---- Auth check ----
    if (password !== process.env.ELIGIBILITY_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // ---- Parse metadata ----
    let meta = {};
    try { meta = JSON.parse(req.body.metadata || '{}'); } catch (_) {}
    const FIELDS = ['timestamp','name','phone','email','loanType','amount','city','source','status','aiCallId'];
    FIELDS.forEach(f => { if (!meta[f]) meta[f] = ''; });
    if (!meta.timestamp) meta.timestamp = new Date().toISOString();
    if (!meta.status)    meta.status    = process.env.ADMIN_STATUS_DEFAULT || 'Pending';

    // ── Fire‑and‑forget: Zapier ──────────────────────────────────
    (async () => {
      try {
        if (process.env.ZAPIER_WEBHOOK_URL) {
          await axios.post(process.env.ZAPIER_WEBHOOK_URL, meta);
          console.log('[zapier] webhook sent');
        }
      } catch (e) { console.error('[zapier] error:', e.message); }
    })();

    // ── Fire‑and‑forget: Email ───────────────────────────────────
    (async () => {
      try {
        const { sendEnquiryEmail } = require('../utils/emailService.cjs');
        await sendEnquiryEmail(meta);
      } catch (e) { console.error('[email] error:', e.message); }
    })();

    // ── Parse uploaded documents ─────────────────────────────────
    const parsed = await parseDocuments(req.files || []);

    // ── Generate Excel ───────────────────────────────────────────
    const excelPath = await generateExcel(parsed, meta);

    // ── Copy Excel to date‑wise output folder ────────────────────
    let destPath = excelPath;
    try {
      const outputRoot = process.env.VERCEL 
        ? '/tmp/eligibility_output'
        : (process.env.ELIGIBILITY_OUTPUT_ROOT || path.join(__dirname, '../../eligibility calculation sheet'));
      const dateFolder = path.join(outputRoot, new Date().toISOString().slice(0, 10));
      if (!fs.existsSync(dateFolder)) fs.mkdirSync(dateFolder, { recursive: true });
      destPath = path.join(dateFolder, path.basename(excelPath));
      fs.copyFileSync(excelPath, destPath);
      console.log(`[eligibility] Excel saved → ${destPath}`);
    } catch (e) {
      console.warn('[eligibility] Could not copy Excel to output root:', e.message);
    }

    // ── External integrations (Google Sheets + HubSpot) ──────────
    await Promise.allSettled([
      appendRowToGoogleSheet(meta),
      syncToHubSpot(meta)
    ]);

    // ── Respond ──────────────────────────────────────────────────
    const fileName = path.basename(excelPath);
    return res.json({
      success    : true,
      downloadUrl: `/api/eligibility/download/${fileName}`,
      excelFile  : fileName,
      message    : 'Eligibility report generated successfully.'
    });

  } catch (e) {
    if (e.code === 'UNSUPPORTED_TYPE' || e.message === 'UNSUPPORTED_TYPE') {
      return res.status(400).json({ message: 'Supported formats are PDF, JPG, PNG (max 10 MB).' });
    }
    if (e.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum allowed size is 10 MB.' });
    }
    console.error('[eligibility] Internal error:', e);
    return res.status(500).json({
      message: 'We could not extract data from the file. Please ensure the document is clear and try again.'
    });
  }
});

// ── GET /api/eligibility/download/:filename ─────────────────────
router.get('/download/:filename', (req, res) => {
  // Sanitise filename to prevent path traversal
  const safeName = path.basename(req.params.filename);
  const baseDir = process.env.VERCEL
    ? '/tmp/uploads/eligibility'
    : (process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'));
  const filePath = path.join(baseDir, safeName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found.' });
  }
  res.download(filePath, safeName, err => {
    if (err) console.error('[download] error:', err.message);
  });
});

// ── GET /api/eligibility/health ─────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    status   : 'ok',
    timestamp: new Date().toISOString(),
    password : process.env.ELIGIBILITY_PASSWORD ? '✅ set' : '❌ not set',
    zapier   : process.env.ZAPIER_WEBHOOK_URL   ? '✅ set' : '❌ not set',
    hubspot  : process.env.HUBSPOT_REFRESH_TOKEN ? '✅ set' : '❌ not set',
    sheets   : process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? '✅ set' : '⚠️ placeholder'
  });
});

// POST /api/eligibility/calculate
router.post(
  "/calculate",
  upload.fields([
    { name: "itrYear1", maxCount: 1 },
    { name: "itrYear2", maxCount: 1 },
    { name: "bankStatements", maxCount: 5 },
    { name: "otherDocs", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const payload = JSON.parse(req.body.payload || '{}');
      const files = {};
      const allFiles = [];

      for (const [key, arr] of Object.entries(req.files || {})) {
        files[key] = arr.map((f) => f.path);
        arr.forEach(f => allFiles.push(f));
      }

      const result = await processEligibility(payload, files);

      let excelFileName = null;
      let downloadUrl = null;
      try {
        if (allFiles.length > 0) {
          const parsedDocs = await parseDocuments(allFiles);
          const meta = {
            timestamp: result.timestamp || new Date().toISOString(),
            name: payload.applicantName || 'Valued Customer',
            phone: payload.phone || '',
            email: payload.email || '',
            loanType: payload.loanType || 'Personal',
            amount: String(result.maxPrincipal || payload.amount || 0),
            city: payload.city || '',
            source: 'AI_Eligibility_Engine',
            status: 'Analyzed',
            aiCallId: ''
          };
          const excelPath = await generateExcel(parsedDocs, meta);

          const outputRoot = process.env.VERCEL 
            ? '/tmp/eligibility_output'
            : (process.env.ELIGIBILITY_OUTPUT_ROOT || path.join(__dirname, '../../eligibility calculation sheet'));
          const dateFolder = path.join(outputRoot, new Date().toISOString().slice(0, 10));
          if (!fs.existsSync(dateFolder)) fs.mkdirSync(dateFolder, { recursive: true });
          const destPath = path.join(dateFolder, path.basename(excelPath));
          fs.copyFileSync(excelPath, destPath);
          excelFileName = path.basename(excelPath);
          downloadUrl = `/api/eligibility/download/${excelFileName}`;

          syncToHubSpot(meta).catch(err => console.warn('[hubspot] sync error:', err.message));
        }
      } catch (docErr) {
        console.warn('[eligibility] Excel/document parsing warning:', docErr.message);
      }

      res.json({
        success: true,
        data: {
          ...result,
          excelFile: excelFileName,
          downloadUrl: downloadUrl
        }
      });
    } catch (e) {
      console.error('[eligibility/calculate error]', e);
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

// Original calculate endpoint removed – now handled via server‑less API and queue.

module.exports = router;
