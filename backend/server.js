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

app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          authRouter);
app.use('/api/notifications', notifsRouter);
app.use('/api/support',       supportRouter);
app.use('/api/upload',        uploadRouter);
app.use('/api/bookings',      bookingsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use((_req, res) => res.status(404).json({ success: false, message: 'المسار غير موجود.' }));
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, message: 'خطأ داخلي.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ضيافة Backend → http://localhost:${PORT}`);
  console.log(`   MAIL_USER: ${process.env.MAIL_USER || '⚠️ not set'}\n`);
});
