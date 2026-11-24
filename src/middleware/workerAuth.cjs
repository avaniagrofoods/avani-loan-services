// src/middleware/workerAuth.cjs
// ─────────────────────────────────────────────────────────────────
// Internal Worker Authentication Middleware
// ─────────────────────────────────────────────────────────────────

const crypto = require('crypto');

function timingSafeCompare(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function workerAuthMiddleware(req, res, next) {
  const workerSecret = String(process.env.INTERNAL_WORKER_SECRET || '').trim();
  if (!workerSecret || workerSecret.length < 16) {
    console.warn('[WorkerAuth] Rejecting request: INTERNAL_WORKER_SECRET is not configured.');
    return res.status(503).json({
      error: 'WORKER_SECRET_UNCONFIGURED',
      message: 'Internal worker authentication is not configured.'
    });
  }

  const providedAuth = String(req.headers['x-worker-auth'] || '').trim();
  if (!providedAuth || !timingSafeCompare(providedAuth, workerSecret)) {
    console.warn('[WorkerAuth] Unauthorized worker access attempt rejected.');
    return res.status(401).json({
      error: 'UNAUTHORIZED_WORKER',
      message: 'Missing or invalid x-worker-auth header.'
    });
  }

  next();
}

module.exports = {
  workerAuthMiddleware
};
