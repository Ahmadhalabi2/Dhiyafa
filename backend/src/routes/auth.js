/**
 * routes/auth.js — MongoDB version
 */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const { saveOtp, verifyOtp }               = require('../services/otpStore');
const { sendOtpEmail }                     = require('../services/emailService');
const { sendOtpLimiter, verifyOtpLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

// ── seed demo users بعد الاتصال بـ DB ─────────────────────────────────────
async function seedDemoUsers() {
  const demos = [
    { name: 'Super Admin',   email: 'admin@stay.com',   password: 'admin123',   role: 'superadmin' },
    { name: 'Support Agent', email: 'support@stay.com', password: 'support123', role: 'support'    },
    { name: 'Ahmad Alhalabi',email: 'user@stay.com',    password: 'user123',    role: 'user'       },
  ];
  for (const d of demos) {
    const exists = await User.findOne({ email: d.email });
    if (!exists) {
      await User.create({ name: d.name, email: d.email, passwordHash: await bcrypt.hash(d.password, 10), role: d.role });
    }
  }
}
// نستدعيها من server.js بعد connectDB

// ── Middleware ─────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'الجلسة منتهية.' }); }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(u) {
  return { id: u._id.toString(), name: u.name, email: u.email, role: u.role, avatar: u.avatar ?? null };
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/send-otp
// ══════════════════════════════════════════════════════════════════════════════
router.post('/send-otp', sendOtpLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'صيغة الإيميل غير صحيحة.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'كلمة المرور 6 أحرف على الأقل.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'هذا الإيميل مسجل مسبقاً.' });

    const otp = generateOtp();
    const passwordHash = await bcrypt.hash(password, 12);
    const expiryMin = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;

    saveOtp(email, { otp, name: name.trim(), passwordHash });
    await sendOtpEmail(email, name.trim(), otp, expiryMin);
    console.log(`[OTP] Sent to ${email} — code: ${otp}`);

    return res.json({ success: true, message: `تم إرسال رمز التحقق إلى ${email}.` });
  } catch (err) {
    console.error('[send-otp]', err.message);
    return res.status(500).json({ success: false, message: 'فشل إرسال الإيميل.', detail: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/verify-otp
// ══════════════════════════════════════════════════════════════════════════════
router.post('/verify-otp', verifyOtpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'الإيميل والرمز مطلوبان.' });

    const result = verifyOtp(email, otp);
    if (!result.valid) {
      const msgs = { not_found: 'لم يُرسل رمز تحقق.', expired: 'انتهت صلاحية الرمز.', wrong: 'الرمز غير صحيح.', max_attempts: 'تجاوزت عدد المحاولات.' };
      return res.status(400).json({ success: false, message: msgs[result.reason] || 'رمز غير صحيح.', reason: result.reason });
    }

    const { name, passwordHash } = result.record;
    const newUser = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'user' });
    console.log(`[Auth] Registered via OTP: ${email}`);

    return res.status(201).json({ success: true, message: 'تم إنشاء الحساب!', token: signToken(newUser), user: safeUser(newUser) });
  } catch (err) {
    console.error('[verify-otp]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/register — تسجيل مباشر بدون OTP
// ══════════════════════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'صيغة الإيميل غير صحيحة.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'كلمة المرور 6 أحرف على الأقل.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'هذا الإيميل مسجل مسبقاً.' });

    const newUser = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'user' });
    console.log(`[Auth] Direct register: ${email}`);

    return res.status(201).json({ success: true, message: 'تم إنشاء الحساب!', token: signToken(newUser), user: safeUser(newUser) });
  } catch (err) {
    console.error('[register]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/check-email
// ══════════════════════════════════════════════════════════════════════════════
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'الإيميل مطلوب.' });
  const taken = !!(await User.findOne({ email: email.toLowerCase() }));
  return res.json({ success: true, taken });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'الإيميل وكلمة المرور مطلوبان.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ success: false, message: 'الإيميل أو كلمة المرور غير صحيحة.' });

    return res.json({ success: true, message: 'مرحباً بعودتك!', token: signToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /api/auth/profile
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });

    if (name?.trim()) user.name = name.trim();

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, message: 'كلمة السر الحالية مطلوبة.' });
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(401).json({ success: false, message: 'كلمة السر الحالية غير صحيحة.' });
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'كلمة السر الجديدة 6 أحرف على الأقل.' });
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    return res.json({ success: true, message: 'تم التحديث.', token: signToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('[patch-profile]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/auth/account
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/account', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ success: false, message: 'هذا الإجراء للمستخدمين فقط.' });
    await User.findByIdAndDelete(req.user.id);
    console.log(`[Auth] Deleted: ${req.user.email}`);
    return res.json({ success: true, message: 'تم حذف الحساب.' });
  } catch (err) {
    console.error('[delete-account]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

module.exports = { router, seedDemoUsers };
