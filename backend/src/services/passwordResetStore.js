/**
 * services/passwordResetStore.js
 * ─────────────────────────────────────────────────────
 * مخزن OTP خاص بإعادة تعيين كلمة المرور — in-memory.
 * منفصل عن otpStore.js (الخاص بالتسجيل) لتجنب التعارض.
 *
 * كل سجل: { otp, expiresAt, attempts }
 * ─────────────────────────────────────────────────────
 */

/** @type {Map<string, { otp: string, expiresAt: number, attempts: number }>} */
const store = new Map();

const OTP_EXPIRY_MS      = () => (parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10) * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

/** حفظ OTP جديد لإيميل معين */
function saveResetOtp(email, otp) {
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS(),
    attempts: 0,
  });
}

/**
 * التحقق من OTP:
 * @returns {{ valid: true }} | {{ valid: false, reason: string }}
 */
function verifyResetOtp(email, inputOtp) {
  const key    = email.toLowerCase();
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

  // صحيح — لكن لا نحذف فوراً، نتركه حتى يكمل reset
  return { valid: true };
}

/** حذف السجل بعد الاستخدام */
function consumeResetOtp(email) {
  store.delete(email.toLowerCase());
}

/** تنظيف دوري كل 15 دقيقة */
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (now > val.expiresAt) store.delete(key);
  }
}, 15 * 60 * 1000);

module.exports = { saveResetOtp, verifyResetOtp, consumeResetOtp };
