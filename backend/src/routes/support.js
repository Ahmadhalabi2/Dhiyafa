const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { SupportThread, SupportMessage, SupportFeedback } = require('../models/SupportThread');

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'الجلسة منتهية.' }); }
}

const isStaff = (r) => r === 'support' || r === 'superadmin';

function fmt(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o.id = o._id.toString();
  if (o.threadId) o.threadId = o.threadId.toString();
  return o;
}

// ── THREADS ────────────────────────────────────────────────────────────────
router.get('/threads', requireAuth, async (req, res) => {
  const threads = isStaff(req.user.role)
    ? await SupportThread.find().sort({ lastMessageAt: -1 }).lean()
    : await SupportThread.find({ userId: req.user.id }).lean();
  return res.json({ success: true, threads: threads.map((t) => ({ ...t, id: t._id.toString() })) });
});

router.post('/threads', requireAuth, async (req, res) => {
  let thread = await SupportThread.findOne({ userId: req.user.id });
  if (!thread) thread = await SupportThread.create({ userId: req.user.id, userName: req.user.name, lastMessagePreview: 'تم بدء محادثة الدعم' });
  return res.json({ success: true, thread: fmt(thread) });
});

// ── MESSAGES ───────────────────────────────────────────────────────────────
router.get('/threads/:threadId/messages', requireAuth, async (req, res) => {
  if (!isStaff(req.user.role)) {
    const thread = await SupportThread.findById(req.params.threadId);
    if (!thread || thread.userId !== req.user.id) return res.status(403).json({ success: false, message: 'غير مصرّح.' });
  }
  const msgs = await SupportMessage.find({ threadId: req.params.threadId }).sort({ createdAt: 1 }).lean();
  return res.json({ success: true, messages: msgs.map((m) => ({ ...m, id: m._id.toString(), threadId: m.threadId.toString(), createdAt: new Date(m.createdAt).getTime() })) });
});

router.post('/threads/:threadId/messages', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'النص مطلوب.' });

  const thread = await SupportThread.findById(req.params.threadId);
  if (!thread) return res.status(404).json({ success: false, message: 'الثريد غير موجود.' });
  if (!isStaff(req.user.role) && thread.userId !== req.user.id) return res.status(403).json({ success: false, message: 'غير مصرّح.' });

  const staff = isStaff(req.user.role);
  const msg = await SupportMessage.create({
    threadId: thread._id, fromRole: req.user.role, fromUserId: req.user.id, fromName: req.user.name,
    text: text.trim(), unreadForSupport: !staff, unreadForUser: staff,
  });

  thread.lastMessageAt = new Date();
  thread.lastMessagePreview = text.trim().slice(0, 60);
  if (!staff) thread.unreadForSupport = (thread.unreadForSupport || 0) + 1;
  else        thread.unreadForUser    = (thread.unreadForUser    || 0) + 1;
  await thread.save();

  return res.status(201).json({ success: true, message: { ...msg.toObject(), id: msg._id.toString(), threadId: msg.threadId.toString(), createdAt: new Date(msg.createdAt).getTime() } });
});

router.patch('/threads/:threadId/read', requireAuth, async (req, res) => {
  const staff = isStaff(req.user.role);
  if (staff) {
    await SupportMessage.updateMany({ threadId: req.params.threadId }, { unreadForSupport: false });
    await SupportThread.findByIdAndUpdate(req.params.threadId, { unreadForSupport: 0 });
  } else {
    await SupportMessage.updateMany({ threadId: req.params.threadId }, { unreadForUser: false });
    await SupportThread.findByIdAndUpdate(req.params.threadId, { unreadForUser: 0 });
  }
  return res.json({ success: true });
});

// ── FEEDBACKS ──────────────────────────────────────────────────────────────
router.get('/feedbacks', requireAuth, async (req, res) => {
  const feedbacks = isStaff(req.user.role)
    ? await SupportFeedback.find().sort({ createdAt: -1 }).lean()
    : await SupportFeedback.find({ userId: req.user.id }).lean();
  return res.json({ success: true, feedbacks: feedbacks.map((f) => ({ ...f, id: f._id.toString() })) });
});

router.post('/feedbacks', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: 'النص مطلوب.' });
  const fb = await SupportFeedback.create({ userId: req.user.id, userName: req.user.name, text: text.trim() });
  return res.status(201).json({ success: true, feedback: fmt(fb) });
});

router.patch('/feedbacks/:id/reply', requireAuth, async (req, res) => {
  if (!isStaff(req.user.role)) return res.status(403).json({ success: false, message: 'غير مصرّح.' });
  const { repliedText } = req.body;
  if (!repliedText?.trim()) return res.status(400).json({ success: false, message: 'نص الرد مطلوب.' });
  await SupportFeedback.findByIdAndUpdate(req.params.id, { repliedText: repliedText.trim(), repliedAt: new Date(), unreadForSupport: false });
  return res.json({ success: true });
});

router.patch('/feedbacks/:id/read', requireAuth, async (req, res) => {
  await SupportFeedback.findByIdAndUpdate(req.params.id, { unreadForSupport: false });
  return res.json({ success: true });
});

router.get('/unread-count', requireAuth, async (req, res) => {
  if (!isStaff(req.user.role)) return res.json({ success: true, threads: 0, feedbacks: 0 });
  const threads   = await SupportThread.aggregate([{ $group: { _id: null, total: { $sum: '$unreadForSupport' } } }]);
  const feedbacks = await SupportFeedback.countDocuments({ unreadForSupport: true });
  return res.json({ success: true, threads: threads[0]?.total || 0, feedbacks });
});

module.exports = { router };
