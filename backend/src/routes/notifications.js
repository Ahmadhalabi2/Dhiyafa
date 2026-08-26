/**
 * routes/notifications.js
 *
 * Endpoints:
 *   GET    /api/notifications           — جلب الإشعارات مع pagination
 *   POST   /api/notifications           — إنشاء إشعار
 *   PATCH  /api/notifications/read-all  — تعليم الكل كمقروء
 *   DELETE /api/notifications           — حذف مجموعة (bulk delete) — body: { ids: [...] } أو { all: true }
 *   PATCH  /api/notifications/:id/read  — تعليم إشعار واحد كمقروء
 *   DELETE /api/notifications/:id       — حذف إشعار واحد
 */

const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createFileStore } = require('../db/fileStore');

const notifsStore = createFileStore('notifications', []);

// ── مساعد لفلترة إشعارات المستخدم ────────────────────────────────────────────
function getUserNotifs(all, user) {
  return all.filter((n) => {
    if (n.targetRole !== user.role) return false;
    if (n.targetUserId) return n.targetUserId === user.id;
    return true;
  });
}

// ── GET /api/notifications — مع pagination وفلاتر ────────────────────────────
router.get('/', requireAuth, (req, res) => {
  const all  = notifsStore.get();
  let   mine = getUserNotifs(all, req.user);

  // فلتر اختياري بالحالة
  const { unread } = req.query;
  if (unread === 'true')  mine = mine.filter((n) => n.unread);
  if (unread === 'false') mine = mine.filter((n) => !n.unread);

  // ترتيب: الأحدث أولاً
  mine = [...mine].sort((a, b) => new Date(b.time) - new Date(a.time));

  // Pagination
  const page       = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit      = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const total      = mine.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data       = mine.slice((page - 1) * limit, page * limit);

  return res.json({
    success: true,
    notifications: data,
    unreadCount: mine.filter((n) => n.unread).length,
    pagination: { page, limit, total, totalPages },
  });
});

// ── POST /api/notifications — إنشاء إشعار ────────────────────────────────────
router.post('/', requireAuth, (req, res) => {
  const { type, bookingId, createdByUserId, createdByName, targetRole, targetUserId, title, desc } = req.body;
  if (!type || !targetRole || !title || !desc)
    return res.status(400).json({ success: false, message: 'حقول ناقصة: type, targetRole, title, desc مطلوبة.' });

  const notif = {
    id:              `EV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    bookingId:       bookingId       || null,
    createdByUserId: createdByUserId || req.user.id,
    createdByName:   createdByName   || req.user.name,
    targetRole,
    targetUserId:    targetUserId    || null,
    title,
    desc,
    time:            new Date().toISOString(),
    unread:          true,
  };
  notifsStore.update((all) => [notif, ...all]);
  return res.status(201).json({ success: true, notification: notif });
});

// ── PATCH /api/notifications/read-all — تعليم الكل كمقروء ────────────────────
router.patch('/read-all', requireAuth, (req, res) => {
  const ids = getUserNotifs(notifsStore.get(), req.user).map((n) => n.id);
  notifsStore.update((all) =>
    all.map((n) => ids.includes(n.id) ? { ...n, unread: false } : n)
  );
  return res.json({ success: true, updated: ids.length });
});

// ── DELETE /api/notifications — Bulk delete ───────────────────────────────────
// Body: { ids: ['id1','id2',...] }  — حذف محدد
// Body: { all: true }              — حذف كل إشعارات المستخدم
router.delete('/', requireAuth, (req, res) => {
  const { ids, all: deleteAll } = req.body;

  if (deleteAll) {
    // حذف كل إشعارات المستخدم
    const myIds = new Set(getUserNotifs(notifsStore.get(), req.user).map((n) => n.id));
    notifsStore.update((all) => all.filter((n) => !myIds.has(n.id)));
    return res.json({ success: true, deleted: myIds.size });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'ids (مصفوفة) أو all: true مطلوبان.' });
  }

  // تأكد أن المستخدم يملك هذه الإشعارات
  const myIds  = new Set(getUserNotifs(notifsStore.get(), req.user).map((n) => n.id));
  const toDelete = ids.filter((id) => myIds.has(id));

  notifsStore.update((all) => all.filter((n) => !toDelete.includes(n.id)));
  return res.json({ success: true, deleted: toDelete.length });
});

// ── PATCH /api/notifications/:id/read — تعليم إشعار واحد كمقروء ──────────────
router.patch('/:id/read', requireAuth, (req, res) => {
  notifsStore.update((all) =>
    all.map((n) => n.id === req.params.id ? { ...n, unread: false } : n)
  );
  return res.json({ success: true });
});

// ── DELETE /api/notifications/:id — حذف إشعار واحد ──────────────────────────
router.delete('/:id', requireAuth, (req, res) => {
  notifsStore.update((all) => all.filter((n) => n.id !== req.params.id));
  return res.json({ success: true });
});

module.exports = { router };
