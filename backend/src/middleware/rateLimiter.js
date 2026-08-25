/**
 * rateLimiter.js
 * ─────────────────────────────────────────────────────
 * حماية endpoints الـ OTP من الإغراق (abuse / brute-force).
 * ─────────────────────────────────────────────────────
 */

const rateLimit = require('express-rate-limit');

/** حد إرسال OTP: 5 طلبات كل 15 دقيقة لنفس الـ IP */
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'طلبات كثيرة جداً، حاول مرة أخرى بعد 15 دقيقة.',
  },
});

/** حد التحقق: 10 محاولات كل 15 دقيقة لنفس الـ IP */
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'محاولات تحقق كثيرة، حاول مرة أخرى بعد 15 دقيقة.',
  },
});

module.exports = { sendOtpLimiter, verifyOtpLimiter };
