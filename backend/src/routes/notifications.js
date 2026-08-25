const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const Notification = require('../models/Notification');

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'الجلسة منتهية.' }); }
}

function buildFilter(user) {
  const f = { targetRole: user.role };
  if (user.role === 'user') f.$or = [{ targetUserId: null }, { targetUserId: user.id }];
  return f;
}

// GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  const notifs = await Notification.find(buildFilter(req.user)).sort({ createdAt: -1 }).lean();
  const unreadCount = notifs.filter((n) => n.unread).length;
  return res.json({ success: true, notifications: notifs.map((n) => ({ ...n, id: n._id.toString() })), unreadCount });
});

// POST /api/notifications
router.post('/', requireAuth, async (req, res) => {
  const { type, bookingId, createdByUserId, createdByName, targetRole, targetUserId, title, desc } = req.body;
  if (!type || !targetRole || !title || !desc) return res.status(400).json({ success: false, message: 'حقول ناقصة.' });

  const notif = await Notification.create({ type, bookingId: bookingId || null, createdByUserId: createdByUserId || req.user.id, createdByName: createdByName || req.user.name, targetRole, targetUserId: targetUserId || null, title, desc });
  return res.status(201).json({ success: true, notification: { ...notif.toObject(), id: notif._id.toString() } });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, async (req, res) => {
  await Notification.updateMany(buildFilter(req.user), { unread: false });
  return res.json({ success: true });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { unread: false });
  return res.json({ success: true });
});

// DELETE /api/notifications/:id
router.delete('/:id', requireAuth, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  return res.json({ success: true });
});

module.exports = { router };
