/**
 * routes/bookings.js
 * ─────────────────────────────────────────────────────
 * Bookings CRUD + إرسال إيميل تأكيد
 *
 * Endpoints:
 *   POST   /api/bookings                    — إنشاء حجز جديد
 *   GET    /api/bookings                    — جلب الحجوزات (مع pagination)
 *   GET    /api/bookings/:id                — جلب حجز واحد
 *   PATCH  /api/bookings/:id/status         — تغيير الحالة (superadmin)
 *   PATCH  /api/bookings/:id/rate           — تقييم الحجز (user)
 *   DELETE /api/bookings/:id                — حذف حجز (superadmin)
 *   POST   /api/bookings/send-confirmation  — إرسال إيميل تأكيد (superadmin)
 *
 * Booking statuses: pending | accepted | completed | cancelled
 * ─────────────────────────────────────────────────────
 */

const router   = require('express').Router();
const nodemailer = require('nodemailer');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createFileStore }          = require('../db/fileStore');

const bookingsStore = createFileStore('bookings', []);

// ── Email transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  tls: { rejectUnauthorized: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () =>
  `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const VALID_STATUSES = ['pending', 'accepted', 'completed', 'cancelled'];

// ── POST /api/bookings — إنشاء حجز ───────────────────────────────────────────
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      hotelId, hotelName, city, country = 'سوريا',
      checkIn, checkOut, nights, guests,
      roomType, extras = [], amount, userEmail,
    } = req.body;

    if (!hotelId || !hotelName || !checkIn || !checkOut || !nights || !guests || !amount) {
      return res.status(400).json({ success: false, message: 'حقول ناقصة: hotelId, hotelName, checkIn, checkOut, nights, guests, amount مطلوبة.' });
    }
    if (nights < 1 || guests < 1) {
      return res.status(400).json({ success: false, message: 'عدد الليالي والضيوف يجب أن يكون 1 على الأقل.' });
    }
    if (userEmail && !isValidEmail(userEmail)) {
      return res.status(400).json({ success: false, message: 'صيغة البريد الإلكتروني غير صحيحة.' });
    }

    const booking = {
      id:           uid(),
      userId:       req.user.id,
      userName:     req.user.name,
      userEmail:    userEmail || req.user.email || null,
      hotelId,
      hotelName,
      city:         city || '',
      country,
      checkIn,
      checkOut,
      nights:       Number(nights),
      guests:       Number(guests),
      roomType:     roomType || 'standard',
      extras:       Array.isArray(extras) ? extras : [],
      amount:       Number(amount),
      status:       'pending',
      rating:       null,
      ratingComment: null,
      createdAt:    Date.now(),
      updatedAt:    Date.now(),
    };

    bookingsStore.update((all) => [booking, ...all]);
    console.log(`[Bookings] Created: ${booking.id} by user ${req.user.id}`);
    return res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('[bookings/create]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── GET /api/bookings — جلب الحجوزات مع pagination ───────────────────────────
router.get('/', requireAuth, (req, res) => {
  try {
    const all = bookingsStore.get();

    // فلترة حسب الـ role
    let filtered;
    if (req.user.role === 'superadmin') {
      filtered = all; // الأدمن يشوف كلشي
    } else {
      filtered = all.filter((b) => b.userId === req.user.id); // المستخدم يشوف حجوزاته فقط
    }

    // فلاتر اختيارية
    const { status, userId, hotelId } = req.query;
    if (status)  filtered = filtered.filter((b) => b.status === status);
    if (userId && req.user.role === 'superadmin')  filtered = filtered.filter((b) => b.userId === userId);
    if (hotelId) filtered = filtered.filter((b) => b.hotelId === hotelId);

    // ترتيب: الأحدث أولاً
    filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

    // Pagination
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data  = filtered.slice((page - 1) * limit, page * limit);

    return res.json({
      success: true,
      bookings: data,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error('[bookings/list]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── GET /api/bookings/:id — جلب حجز واحد ─────────────────────────────────────
router.get('/:id', requireAuth, (req, res) => {
  const booking = bookingsStore.get().find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'الحجز غير موجود.' });

  // المستخدم يشوف حجوزاته فقط، الأدمن يشوف أي حجز
  if (req.user.role !== 'superadmin' && booking.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'غير مصرّح.' });
  }

  return res.json({ success: true, booking });
});

// ── PATCH /api/bookings/:id/status — تغيير الحالة (superadmin فقط) ───────────
router.patch('/:id/status', requireAuth, requireRole('superadmin'), (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `الحالة غير صحيحة. القيم المقبولة: ${VALID_STATUSES.join(', ')}` });
    }

    const all = bookingsStore.get();
    const idx = all.findIndex((b) => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'الحجز غير موجود.' });

    const updated = { ...all[idx], status, updatedAt: Date.now() };
    all[idx] = updated;
    bookingsStore.set(all);

    console.log(`[Bookings] Status updated: ${updated.id} → ${status}`);
    return res.json({ success: true, booking: updated });
  } catch (err) {
    console.error('[bookings/status]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── PATCH /api/bookings/:id/rate — تقييم الحجز (user صاحب الحجز) ─────────────
router.patch('/:id/rate', requireAuth, (req, res) => {
  try {
    const { rating, ratingComment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'التقييم يجب أن يكون بين 1 و 5.' });
    }

    const all = bookingsStore.get();
    const idx = all.findIndex((b) => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'الحجز غير موجود.' });

    const booking = all[idx];
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'غير مصرّح.' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'لا يمكن تقييم الحجز إلا بعد إكماله.' });
    }
    if (booking.rating !== null) {
      return res.status(400).json({ success: false, message: 'تم تقييم هذا الحجز مسبقاً.' });
    }

    const updated = {
      ...booking,
      rating: Number(rating),
      ratingComment: ratingComment?.trim() || null,
      updatedAt: Date.now(),
    };
    all[idx] = updated;
    bookingsStore.set(all);

    console.log(`[Bookings] Rated: ${updated.id} → ${rating}/5`);
    return res.json({ success: true, booking: updated });
  } catch (err) {
    console.error('[bookings/rate]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── DELETE /api/bookings/:id — حذف حجز (superadmin فقط) ──────────────────────
router.delete('/:id', requireAuth, requireRole('superadmin'), (req, res) => {
  try {
    const all = bookingsStore.get();
    const exists = all.some((b) => b.id === req.params.id);
    if (!exists) return res.status(404).json({ success: false, message: 'الحجز غير موجود.' });

    bookingsStore.update((all) => all.filter((b) => b.id !== req.params.id));
    console.log(`[Bookings] Deleted: ${req.params.id}`);
    return res.json({ success: true, message: 'تم حذف الحجز.' });
  } catch (err) {
    console.error('[bookings/delete]', err.message);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم.' });
  }
});

// ── POST /api/bookings/send-confirmation — إرسال إيميل تأكيد ─────────────────
router.post('/send-confirmation', requireAuth, requireRole('superadmin'), async (req, res) => {
  const { booking, userEmail } = req.body;
  if (!booking || !userEmail)
    return res.status(400).json({ success: false, message: 'booking و userEmail مطلوبان.' });
  if (!isValidEmail(userEmail))
    return res.status(400).json({ success: false, message: 'صيغة البريد الإلكتروني غير صحيحة.' });

  try {
    const html = buildConfirmationHtml(booking);
    await transporter.sendMail({
      from:    `"${process.env.MAIL_FROM_NAME || 'ضيافة'}" <${process.env.MAIL_USER}>`,
      to:      userEmail,
      subject: `✅ تأكيد حجزك في ${booking.hotelName} — ${booking.id}`,
      html,
      text: `تأكيد حجزك في ضيافة\nرقم الحجز: ${booking.id}\nالفندق: ${booking.hotelName}\nالوصول: ${booking.checkIn}\nالمغادرة: ${booking.checkOut}\nالمبلغ: $${booking.amount}`,
    });
    console.log(`[Bookings] Confirmation sent to ${userEmail} for ${booking.id}`);
    return res.json({ success: true, message: 'تم إرسال تأكيد الحجز بنجاح.' });
  } catch (err) {
    console.error('[send-confirmation]', err.message);
    return res.status(500).json({ success: false, message: 'فشل إرسال الإيميل.', detail: err.message });
  }
});

// ── HTML Builder ──────────────────────────────────────────────────────────────
function buildConfirmationHtml(booking) {
  const {
    id, userName, hotelName, city, country = 'سوريا',
    checkIn, checkOut, nights, guests, amount,
    extras = [], roomType,
  } = booking;

  const SYP_RATE  = 115;
  const formatSYP = (usd) => Math.round(usd * SYP_RATE).toLocaleString('en-US');
  const roomLabel = roomType === 'suite' ? 'جناح ملكي فاخر' : roomType === 'family' ? 'جناح عائلي متصل' : 'غرفة قياسية ديلوكس';
  const year      = new Date().getFullYear();

  const extrasRows = extras?.length
    ? extras.map((ex) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E5DFC8;font-size:12px;color:#52655F;text-align:right;">${ex.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5DFC8;font-size:12px;color:#1C2B27;text-align:left;font-weight:700;"><bdi dir="ltr">$${ex.amount?.toLocaleString() ?? '—'}</bdi></td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding:10px 12px;font-size:11px;color:#93A29B;text-align:center;">لا توجد إضافات</td></tr>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>تأكيد الحجز — ضيافة</title>
</head>
<body style="margin:0;padding:0;background-color:#F3EEE1;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3EEE1;padding:16px 0;">
    <tr><td align="center" style="padding:0 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:440px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(29,45,40,0.08);border:1px solid #EDE6D6;margin:0 auto;">
        <tr>
          <td style="background:linear-gradient(135deg,#0E5C4A 0%,#0A4437 100%);padding:20px 16px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:4px 14px;margin-bottom:6px;">
              <span style="color:#E8C766;font-size:18px;font-weight:800;letter-spacing:1px;">ضِيافة</span>
            </div>
            <p style="color:#FFFFFF;margin:0;font-size:13px;font-weight:600;">تأكيد الحجز</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 16px;">
            <p style="color:#152A24;font-size:15px;margin:0 0 6px;font-weight:700;">أهلاً <bdi dir="ltr">${userName}</bdi>،</p>
            <p style="color:#4A5568;font-size:12px;margin:0 0 16px;line-height:1.6;">يسعدنا إعلامك بأن حجزك قد تم تأكيده بنجاح.</p>
            <div style="background:linear-gradient(135deg,#F8F4EA 0%,#EDE6D6 100%);border:1.5px solid #C69A3A;border-radius:12px;padding:12px 10px;text-align:center;margin-bottom:16px;">
              <p style="margin:0 0 4px;font-size:10px;color:#8A6A1F;letter-spacing:1px;font-weight:700;">رقم الحجز</p>
              <span style="font-size:14px;font-weight:800;color:#0E5C4A;font-family:'Courier New',monospace;direction:ltr;">${id}</span>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F4EA;border-radius:10px;border:1px solid #E5DFC8;margin-bottom:16px;">
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #EDE6D6;" colspan="2">
                  <p style="margin:0 0 2px;font-size:10px;color:#93A29B;font-weight:700;">الفندق</p>
                  <p style="margin:0;font-size:13.5px;font-weight:700;color:#1C2B27;"><bdi>${hotelName}</bdi></p>
                  <p style="margin:2px 0 0;font-size:11px;color:#52655F;">${city}، ${country}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #EDE6D6;width:50%;border-left:1px solid #EDE6D6;">
                  <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">تسجيل الوصول</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#0E5C4A;direction:ltr;">${checkIn}</p>
                </td>
                <td style="padding:10px 12px;border-bottom:1px solid #EDE6D6;width:50%;">
                  <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">تسجيل المغادرة</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#BD5B3E;direction:ltr;">${checkOut}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-left:1px solid #EDE6D6;">
                  <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">عدد الليالي</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#1C2B27;">${nights} ليلة</p>
                </td>
                <td style="padding:10px 12px;">
                  <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">عدد الضيوف</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#1C2B27;">${guests} ضيف</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-top:1px solid #EDE6D6;" colspan="2">
                  <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">نوع الغرفة</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#1C2B27;">${roomLabel}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#1C2B27;">الإضافات المختارة</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5DFC8;border-radius:8px;margin-bottom:16px;">
              <tr style="background:#F8F4EA;">
                <th style="padding:6px 12px;font-size:10px;color:#52655F;text-align:right;border-bottom:1px solid #E5DFC8;">الإضافة</th>
                <th style="padding:6px 12px;font-size:10px;color:#52655F;text-align:left;border-bottom:1px solid #E5DFC8;">المبلغ</th>
              </tr>
              ${extrasRows}
            </table>
            <div style="background:linear-gradient(135deg,#0E5C4A 0%,#0A4437 100%);border-radius:12px;padding:12px 14px;margin-bottom:16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);">الإجمالي الكلي</p>
                    <p style="margin:2px 0 0;font-size:18px;font-weight:800;color:#FFFFFF;"><bdi dir="ltr">$${amount.toLocaleString()}</bdi></p>
                    <p style="margin:2px 0 0;font-size:10px;color:#E8C766;">يعادل تقريباً ${formatSYP(amount)} ل.س</p>
                  </td>
                  <td style="text-align:left;vertical-align:middle;">
                    <div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:4px 8px;">
                      <span style="color:#FFFFFF;font-size:10.5px;font-weight:700;">✅ مدفوع ومؤكد</span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <div style="background:#FFF8EC;border:1px solid #F5D87A;border-radius:10px;padding:10px 12px;">
              <p style="margin:0;font-size:11px;color:#7A5A00;line-height:1.5;">📌 يرجى الاحتفاظ بهذا البريد كإثبات للحجز وتقديمه عند الوصول للفندق.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#F8F4EA;padding:12px 16px;border-top:1px solid #EDE6D6;text-align:center;">
            <p style="margin:0;font-size:10px;color:#A09484;">© ${year} ضيافة - Dhiyafa · جميع الحقوق محفوظة</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { router, bookingsStore };
