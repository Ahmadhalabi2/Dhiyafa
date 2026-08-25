const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'الجلسة منتهية.' }); }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${req.user.id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('يُسمح فقط بـ jpg, png, webp'));
  },
});

// POST /api/upload/avatar
router.post('/avatar', requireAuth, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف.' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // حذف الصور القديمة بامتدادات مختلفة
    ['.jpg', '.jpeg', '.png', '.webp'].forEach((ext) => {
      const old = path.join(AVATARS_DIR, `${req.user.id}${ext}`);
      if (old !== path.join(AVATARS_DIR, req.file.filename) && fs.existsSync(old)) fs.unlinkSync(old);
    });

    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    console.log(`[Upload] Avatar: ${req.user.email} → ${avatarUrl}`);
    return res.json({ success: true, avatarUrl });
  });
});

// DELETE /api/upload/avatar
router.delete('/avatar', requireAuth, async (req, res) => {
  ['.jpg', '.jpeg', '.png', '.webp'].forEach((ext) => {
    const f = path.join(AVATARS_DIR, `${req.user.id}${ext}`);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
  await User.findByIdAndUpdate(req.user.id, { avatar: null });
  return res.json({ success: true, message: 'تم حذف الصورة.' });
});

module.exports = { router };
