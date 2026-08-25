/**
 * otpStore.js
 * ─────────────────────────────────────────────────────
 * مخزن OTP في الذاكرة (in-memory) — كافي للتطوير المحلي.
 * كل سجل:  { otp, name, passwordHash, expiresAt, attempts }
 * ─────────────────────────────────────────────────────
 */

/** @type {Map<string, { otp: string, name: string, passwordHash: string, expiresAt: number, attempts: number }>} */
const store = new Map();

const OTP_EXPIRY_MS = () =>
  (parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10) * 60 * 1000;

const MAX_VERIFY_ATTEMPTS = 5;

/**
 * حفظ OTP جديد لإيميل معين.
 * إذا كان في سجل قديم يُستبدل تلقائياً.
 */
function saveOtp(email, { otp, name, passwordHash }) {
  store.set(email.toLowerCase(), {
    otp,
    name,
    passwordHash,
    expiresAt: Date.now() + OTP_EXPIRY_MS(),
    attempts: 0,
  });
}

/**
 * التحقق من OTP:
 * @returns {{ valid: true }} | {{ valid: false, reason: 'not_found'|'expired'|'wrong'|'max_attempts' }}
 */
function verifyOtp(email, inputOtp) {
  const key = email.toLowerCase();
  const record = store.get(key);

  if (!record) return { valid: false, reason: 'not_found' };
  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { valid: false, reason: 'expired' };
  }
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    store.delete(key);
    return { valid: false, reason: 'max_attempts' };
  }

  if (record.otp !== String(inputOtp).trim()) {
    record.attempts += 1;
    return { valid: false, reason: 'wrong' };
  }

  // OTP صحيح — نحذف السجل فوراً (one-time use)
  store.delete(key);
  return { valid: true, record };
}

/**
 * جلب بيانات الـ pending registration بدون حذف السجل.
 * مفيدة لو بدنا نعرض اسم المستخدم في رد الـ send-otp.
 */
function getRecord(email) {
  return store.get(email.toLowerCase()) || null;
}

/** تنظيف دوري للسجلات المنتهية (كل 15 دقيقة) */
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (now > val.expiresAt) store.delete(key);
  }
}, 15 * 60 * 1000);

module.exports = { saveOtp, verifyOtp, getRecord };
