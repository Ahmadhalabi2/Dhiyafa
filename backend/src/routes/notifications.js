const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { createFileStore } = require('../db/fileStore');

const notifsStore = createFileStore('notifications', []);

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

router.get('/', requireAuth, (req, res) => {
  const all   = notifsStore.get();
  const mine  = all.filter((n) => {
    if (n.targetRole !== req.user.role) return false;
    if (n.targetUserId) return n.targetUserId === req.user.id;
    return true;
  });
  return res.json({ success: true, notifications: mine.map((n) => ({ ...n, id: n.id })), unreadCount: mine.filter((n) => n.unread).length });
});

router.post('/', requireAuth, (req, res) => {
  const { type, bookingId, createdByUserId, createdByName, targetRole, targetUserId, title, desc } = req.body;
  if (!type || !targetRole || !title || !desc) return res.status(400).json({ success: false, message: 'حقول ناقصة.' });
  const notif = {
    id: `EV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,
    type, bookingId: bookingId || null,
    createdByUserId: createdByUserId || req.user.id, createdByName: createdByName || req.user.name,
    targetRole, targetUserId: targetUserId || null, title, desc,
    time: new Date().toISOString(), unread: true,
  };
  notifsStore.update((all) => [notif, ...all]);
  return res.status(201).json({ success: true, notification: notif });
});

router.patch('/read-all', requireAuth, (req, res) => {
  const all  = notifsStore.get();
  const ids  = all.filter((n) => {
    if (n.targetRole !== req.user.role) return false;
    if (n.targetUserId) return n.targetUserId === req.user.id;
    return true;
  }).map((n) => n.id);
  notifsStore.update((all) => all.map((n) => ids.includes(n.id) ? { ...n, unread: false } : n));
  return res.json({ success: true });
});

router.patch('/:id/read', requireAuth, (req, res) => {
  notifsStore.update((all) => all.map((n) => n.id === req.params.id ? { ...n, unread: false } : n));
  return res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  notifsStore.update((all) => all.filter((n) => n.id !== req.params.id));
  return res.json({ success: true });
});

module.exports = { router };
