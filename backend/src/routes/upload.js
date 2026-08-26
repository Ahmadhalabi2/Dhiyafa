const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { requireAuth } = require('../middleware/auth');
const { usersStore } = require('./auth');

const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });

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
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف.' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // حذف الصور القديمة
    ['.jpg', '.jpeg', '.png', '.webp'].forEach((ext) => {
      const old = path.join(AVATARS_DIR, `${req.user.id}${ext}`);
      if (old !== path.join(AVATARS_DIR, req.file.filename) && fs.existsSync(old)) fs.unlinkSync(old);
    });

    usersStore.update((users) =>
      users.map((u) => u.id === req.user.id ? { ...u, avatar: avatarUrl } : u)
    );

    return res.json({ success: true, avatarUrl });
  });
});

// DELETE /api/upload/avatar
router.delete('/avatar', requireAuth, (req, res) => {
  ['.jpg', '.jpeg', '.png', '.webp'].forEach((ext) => {
    const f = path.join(AVATARS_DIR, `${req.user.id}${ext}`);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
  usersStore.update((users) =>
    users.map((u) => u.id === req.user.id ? { ...u, avatar: null } : u)
  );
  return res.json({ success: true, message: 'تم حذف الصورة.' });
});

module.exports = { router };
