/**
 * server.js — ضيافة Backend
 * ─────────────────────────────────────────────────────
 * نقطة الدخول الرئيسية للخادم.
 * يشغّل Express + CORS + Rate-limiting + Auth routes.
 * ─────────────────────────────────────────────────────
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { router: authRouter }     = require('./src/routes/auth');
const { router: notifsRouter }   = require('./src/routes/notifications');
const { router: supportRouter }  = require('./src/routes/support');
const { router: uploadRouter }   = require('./src/routes/upload');
const { router: bookingsRouter } = require('./src/routes/bookings');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// CORS: اقبل طلبات من الفرونت‌اند فقط
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Static files ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/notifications', notifsRouter);
app.use('/api/support',       supportRouter);
app.use('/api/upload',        uploadRouter);
app.use('/api/bookings',      bookingsRouter);

// Health check — للتأكد من أن الخادم شغال
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'dhiyafa-backend',
    time: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'المسار غير موجود.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم.' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ضيافة Backend running at http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/api/health`);
  console.log(`   Send OTP:   POST http://localhost:${PORT}/api/auth/send-otp`);
  console.log(`   Verify OTP: POST http://localhost:${PORT}/api/auth/verify-otp`);
  console.log(`\n   MAIL_USER: ${process.env.MAIL_USER || '⚠️  not set!'}`);
  console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});
