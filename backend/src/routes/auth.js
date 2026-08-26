/**
 * routes/auth.js — fileStore version
 */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const { saveOtp, verifyOtp }                         = require('../services/otpStore');
const { saveResetOtp, verifyResetOtp, consumeResetOtp } = require('../services/passwordResetStore');
const { sendOtpEmail, sendPasswordResetEmail }        = require('../services/emailService');
const { sendOtpLimiter, verifyOtpLimiter }            = require('../middleware/rateLimiter');
const { requireAuth }                                 = require('../middleware/auth');
const { createFileStore }                             = require('../db/fileStore');

// ── Users DB ─────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: '1', name: 'Super Admin',   email: 'admin@stay.com',   passwordHash: bcrypt.hashSync('admin123',   10), role: 'superadmin', createdAt: Date.now() },
  { id: '2', name: 'Support Agent', email: 'support@stay.com', passwordHash: bcrypt.hashSync('support123', 10), role: 'support',    createdAt: Date.now() },
  { id: '3', name: 'Ahmad Alhalabi',email: 'user@stay.com',    passwordHash: bcrypt.hashSync('user123',    10), role: 'user',       createdAt: Date.now() },
];

const usersStore = createFileStore('users', DEMO_USERS);

(function ensureDemoUsers() {
  const users = usersStore.get();
  let changed = false;
  for (const demo of DEMO_USERS) {
    if (!users.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
      users.push(demo); changed = true;
    }
  }
  if (changed) usersStore.set(users);
})();

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar ?? null };
}

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post('/send-otp', sendOtpLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'صيغة الإيميل غير صحيحة.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'كلمة المرور 6 أحرف على الأقل.' });

    if (usersStore.get().find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ success: false, message: 'هذا الإيميل مسجل مسبقاً.' });

    const otp = generateOtp();
    const passwordHash = await bcrypt.hash(password, 12);
    const expiryMin = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;

    saveOtp(email, { otp, name: name.trim(), passwordHash });
    await sendOtpEmail(email, name.trim(), otp, expiryMin);
    console.log(`[OTP] Sent to ${email} — code: ${otp}`);

    return res.json({ success: true, message: `تم إرسال رمز التحقق إلى ${email}.` });
  } catch (err) {
    console.error('[send-otp]', err.message);
    return res.status(500).json({ success: false, message: 'فشل إرسال الإيميل. تحقق من إعدادات .env', detail: err.message });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
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
    const newUser = { id: Date.now().toString(), name, email: email.toLowerCase(), passwordHash, role: 'user', createdAt: Date.now() };
    usersStore.update((users) => [...users, newUser]);
    console.log(`[Auth] Registered: ${email}`);

    return res.status(201).json({ success: true, message: 'تم إنشاء الحساب!', token: signToken(newUser), user: safeUser(newUser) });
  } catch (err) {
    console.error('[verify-otp]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة.' });
    if (usersStore.get().find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ success: false, message: 'هذا الإيميل مسجل مسبقاً.' });

    const newUser = { id: Date.now().toString(), name: name.trim(), email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'user', createdAt: Date.now() };
    usersStore.update((users) => [...users, newUser]);

    return res.status(201).json({ success: true, message: 'تم إنشاء الحساب!', token: signToken(newUser), user: safeUser(newUser) });
  } catch (err) {
    console.error('[register]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── POST /api/auth/check-email ────────────────────────────────────────────────
router.post('/check-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'الإيميل مطلوب.' });
  const taken = usersStore.get().some((u) => u.email.toLowerCase() === email.toLowerCase());
  return res.json({ success: true, taken });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'الإيميل وكلمة المرور مطلوبان.' });

    const user = usersStore.get().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ success: false, message: 'الإيميل أو كلمة المرور غير صحيحة.' });

    return res.json({ success: true, message: 'مرحباً بعودتك!', token: signToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── POST /api/auth/forgot-password — إرسال OTP لإعادة تعيين كلمة المرور ───────
router.post('/forgot-password', sendOtpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'الإيميل مطلوب.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'صيغة الإيميل غير صحيحة.' });

    // نتحقق أن الإيميل موجود — لكن نرد بنفس الرسالة في كلا الحالتين لتجنب user enumeration
    const user = usersStore.get().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const otp = generateOtp();
      const expiryMin = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;
      saveResetOtp(email, otp);
      await sendPasswordResetEmail(email, user.name, otp, expiryMin);
      console.log(`[PasswordReset] OTP sent to ${email} — code: ${otp}`);
    }

    // نرد بنفس الرسالة سواء وُجد الإيميل أم لا
    return res.json({ success: true, message: 'إذا كان الإيميل مسجلاً، ستصلك رسالة برمز التحقق.' });
  } catch (err) {
    console.error('[forgot-password]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── POST /api/auth/reset-password — تغيير كلمة المرور بعد التحقق من OTP ───────
router.post('/reset-password', verifyOtpLimiter, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: 'الإيميل والرمز وكلمة المرور الجديدة مطلوبة.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة 6 أحرف على الأقل.' });

    // التحقق من OTP
    const result = verifyResetOtp(email, otp);
    if (!result.valid) {
      const msgs = {
        not_found:    'لم يُرسل رمز تحقق لهذا الإيميل.',
        expired:      'انتهت صلاحية الرمز. أعد الطلب.',
        wrong:        'الرمز غير صحيح.',
        max_attempts: 'تجاوزت عدد المحاولات. أعد الطلب.',
      };
      return res.status(400).json({ success: false, message: msgs[result.reason] || 'رمز غير صحيح.', reason: result.reason });
    }

    // تحديث كلمة المرور
    const users = usersStore.get();
    const idx   = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });

    users[idx] = { ...users[idx], passwordHash: await bcrypt.hash(newPassword, 12) };
    usersStore.set(users);

    // حذف OTP بعد الاستخدام
    consumeResetOtp(email);
    console.log(`[PasswordReset] Password updated for ${email}`);

    return res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' });
  } catch (err) {
    console.error('[reset-password]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const users = usersStore.get();
    const idx   = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });

    const user = { ...users[idx] };
    if (name?.trim()) user.name = name.trim();
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, message: 'كلمة السر الحالية مطلوبة.' });
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(401).json({ success: false, message: 'كلمة السر الحالية غير صحيحة.' });
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'كلمة السر الجديدة 6 أحرف على الأقل.' });
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }
    users[idx] = user;
    usersStore.set(users);
    return res.json({ success: true, message: 'تم التحديث.', token: signToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('[patch-profile]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── DELETE /api/auth/account ──────────────────────────────────────────────────
router.delete('/account', requireAuth, (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ success: false, message: 'هذا الإجراء للمستخدمين فقط.' });
    const users = usersStore.get();
    const idx   = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'الحساب غير موجود.' });
    users.splice(idx, 1);
    usersStore.set(users);
    return res.json({ success: true, message: 'تم حذف الحساب.' });
  } catch (err) {
    console.error('[delete-account]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── GET /api/auth/users — جلب كل المستخدمين مع pagination (superadmin) ─────────
router.get('/users', requireAuth, (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ success: false, message: 'غير مصرّح.' });

  let users = usersStore.get().map(({ passwordHash, ...u }) => u);

  // فلتر اختياري بالـ role
  const { role } = req.query;
  if (role) users = users.filter((u) => u.role === role);

  // Pagination
  const page       = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit      = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const total      = users.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data       = users.slice((page - 1) * limit, page * limit);

  return res.json({ success: true, users: data, pagination: { page, limit, total, totalPages } });
});

// ── DELETE /api/auth/users/:id (superadmin) ───────────────────────────────────
router.delete('/users/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ success: false, message: 'غير مصرّح.' });
  if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'لا يمكن حذف حسابك.' });
  usersStore.update((users) => users.filter((u) => u.id !== req.params.id));
  return res.json({ success: true, message: 'تم الحذف.' });
});

module.exports = { router, usersStore };
