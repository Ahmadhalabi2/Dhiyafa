require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { connectDB }                    = require('./src/db/connect');
const { router: authRouter, seedDemoUsers } = require('./src/routes/auth');
const { router: notifsRouter }         = require('./src/routes/notifications');
const { router: supportRouter }        = require('./src/routes/support');
const { router: uploadRouter }         = require('./src/routes/upload');
const { router: bookingsRouter }       = require('./src/routes/bookings');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Trust Railway's reverse proxy ─────────────────────────────────────────
app.set('trust proxy', 1);

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// CORS configuration (يسمح برابط الفرونت إند المح محدد، وأيضاً يحمي من مشكلة undefined origin)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Static files ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check (ضروري جداً لـ Railway) ──────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/notifications', notifsRouter);
app.use('/api/support',        supportRouter);
app.use('/api/upload',         uploadRouter);
app.use('/api/bookings',       bookingsRouter);

// ── 404 & Error ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'المسار غير موجود.' }));
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, message: 'خطأ داخلي.' });
});

// ── Start Server First, Then Connect DB ─────────────────────────────────────
// نفتح البورت فوراً على 0.0.0.0 ليجتاز Railway Health Check
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ضيافة Backend -> Running on port ${PORT}`);
  console.log(`   MAIL_USER:  ${process.env.MAIL_USER || '⚠️ not set'}`);
  console.log(`   MONGODB:    ${process.env.MONGODB_URI ? '✅ URI exists' : '⚠️ not set'}\n`);
});

// الاتصال بقاعدة البيانات بشكل مستقل
connectDB()
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    try {
      await seedDemoUsers();
      console.log('✅ Seed completed successfully');
    } catch (seedErr) {
      console.error('⚠️ Seeding failed (non-fatal):', seedErr.message);
    }
  })
  .catch((dbErr) => {
    console.error('❌ MongoDB Connection Error:', dbErr.message);
  });