/**
 * middleware/auth.js
 * ─────────────────────────────────────────────────────
 * Shared authentication middleware — مشترك بين جميع routes.
 * بدل ما نكرر requireAuth في كل ملف.
 * ─────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');

/**
 * requireAuth — يتحقق من JWT في Authorization header.
 * يحط بيانات المستخدم في req.user ويكمل للـ next middleware.
 */
function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  }
  try {
    req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'الجلسة منتهية.' });
  }
}

/**
 * requireRole(...roles) — يتحقق من role بعد requireAuth.
 * الاستخدام: router.get('/admin', requireAuth, requireRole('superadmin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'غير مصرّح.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
