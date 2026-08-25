const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { createFileStore } = require('../db/fileStore');

const threadsStore   = createFileStore('support_threads',   []);
const messagesStore  = createFileStore('support_messages',  []);
const feedbacksStore = createFileStore('support_feedbacks', []);

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'الجلسة منتهية.' }); }
}

const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const now = () => Date.now();
const isStaff = (r) => r === 'support' || r === 'superadmin';

router.get('/threads', requireAuth, (req, res) => {
  const threads = isStaff(req.user.role) ? threadsStore.get() : threadsStore.get().filter((t) => t.userId === req.user.id);
  return res.json({ success: true, threads });
});

router.post('/threads', requireAuth, (req, res) => {
  const existing = threadsStore.get().find((t) => t.userId === req.user.id);
  if (existing) return res.json({ success: true, thread: existing });
  const thread = { id: uid('TH'), userId: req.user.id, userName: req.user.name, createdAt: now(), lastMessageAt: now(), lastMessagePreview: 'تم بدء محادثة الدعم', unreadForSupport: 0, unreadForUser: 0 };
  threadsStore.update((all) => [thread, ...all]);
  return res.json({ success: true, thread });
});

router.get('/threads/:threadId/messages', requireAuth, (req, res) => {
  const msgs = messagesStore.get().filter((m) => m.threadId === req.params.threadId);
  return res.json({ success: true, messages: msgs });
});

router.post('/threads/:threadId/messages', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'النص مطلوب.' });
  const staff = isStaff(req.user.role);
  const msg = { id: uid('MSG'), threadId: req.params.threadId, fromRole: req.user.role, fromUserId: req.user.id, fromName: req.user.name, text: text.trim(), createdAt: now(), unreadForSupport: !staff, unreadForUser: staff };
  messagesStore.update((all) => [...all, msg]);
  threadsStore.update((all) => all.map((t) => t.id === req.params.threadId ? { ...t, lastMessageAt: now(), lastMessagePreview: text.trim().slice(0,60) } : t));
  return res.status(201).json({ success: true, message: msg });
});

router.patch('/threads/:threadId/read', requireAuth, (req, res) => {
  const staff = isStaff(req.user.role);
  messagesStore.update((all) => all.map((m) => m.threadId === req.params.threadId ? { ...m, ...(staff ? { unreadForSupport: false } : { unreadForUser: false }) } : m));
  return res.json({ success: true });
});

router.get('/feedbacks', requireAuth, (req, res) => {
  const fbs = isStaff(req.user.role) ? feedbacksStore.get() : feedbacksStore.get().filter((f) => f.userId === req.user.id);
  return res.json({ success: true, feedbacks: fbs });
});

router.post('/feedbacks', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'النص مطلوب.' });
  const fb = { id: uid('FB'), userId: req.user.id, userName: req.user.name, text: text.trim(), createdAt: now(), unreadForSupport: true };
  feedbacksStore.update((all) => [fb, ...all]);
  return res.status(201).json({ success: true, feedback: fb });
});

router.patch('/feedbacks/:id/reply', requireAuth, (req, res) => {
  if (!isStaff(req.user.role)) return res.status(403).json({ success: false, message: 'غير مصرّح.' });
  const { repliedText } = req.body;
  feedbacksStore.update((all) => all.map((f) => f.id === req.params.id ? { ...f, repliedText: repliedText?.trim(), repliedAt: now(), unreadForSupport: false } : f));
  return res.json({ success: true });
});

router.patch('/feedbacks/:id/read', requireAuth, (req, res) => {
  feedbacksStore.update((all) => all.map((f) => f.id === req.params.id ? { ...f, unreadForSupport: false } : f));
  return res.json({ success: true });
});

router.get('/unread-count', requireAuth, (req, res) => {
  if (!isStaff(req.user.role)) return res.json({ success: true, threads: 0, feedbacks: 0 });
  const threads   = new Set(messagesStore.get().filter((m) => m.unreadForSupport).map((m) => m.threadId)).size;
  const feedbacks = feedbacksStore.get().filter((f) => f.unreadForSupport).length;
  return res.json({ success: true, threads, feedbacks });
});

module.exports = { router };
