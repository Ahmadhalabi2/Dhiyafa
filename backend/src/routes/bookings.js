/**
 * routes/bookings.js
 * ─────────────────────────────────────────────────────
 * POST /api/bookings/send-confirmation
 * يرسل إيميل تأكيد حجز بتصميم HTML احترافي ومتجاوب بالكامل
 * ─────────────────────────────────────────────────────
 */

const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.MAIL_FROM
  ? `${process.env.MAIL_FROM_NAME || 'ضيافة'} <${process.env.MAIL_FROM}>`
  : 'ضيافة - Dhiyafa <onboarding@resend.dev>';

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'غير مصرّح.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ success: false, message: 'الجلسة منتهية.' }); }
}

const OTP_DOMAINS = ['gmail.com','yahoo.com','yahoo.co.uk','outlook.com','hotmail.com','live.com'];
function isOtpEmail(email = '') {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return OTP_DOMAINS.includes(domain);
}

// ── بناء HTML الإيميل ─────────────────────────────────────────────────────
function buildConfirmationHtml(booking) {
  const {
    id, userName, hotelName, city, country = 'سوريا',
    checkIn, checkOut, nights, guests, amount,
    extras = [], roomType,
  } = booking;

  const SYP_RATE = 115;
  const formatSYP = (usd) => Math.round(usd * SYP_RATE).toLocaleString('en-US');

  const extrasRows = (extras && extras.length > 0)
    ? extras.map((ex) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E5DFC8;font-size:12px;color:#52655F;text-align:right;">${ex.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5DFC8;font-size:12px;color:#1C2B27;text-align:left;font-weight:700;"><bdi dir="ltr">$${ex.amount?.toLocaleString() ?? '—'}</bdi></td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding:10px 12px;font-size:11px;color:#93A29B;text-align:center;">لا توجد إضافات</td></tr>`;

  const roomLabel = roomType === 'suite' ? 'جناح ملكي فاخر' : roomType === 'family' ? 'جناح عائلي متصل' : 'غرفة قياسية ديلوكس';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>تأكيد الحجز — ضيافة</title>
</head>
<body style="margin:0;padding:0;background-color:#F3EEE1;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3EEE1;padding:16px 0;">
    <tr>
      <td align="center" style="padding:0 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:440px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;
                      box-shadow:0 6px 24px rgba(29,45,40,0.08);border:1px solid #EDE6D6;margin:0 auto;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0E5C4A;background:linear-gradient(135deg,#0E5C4A 0%,#0A4437 100%);
                       padding:20px 16px;text-align:center;">
              <div style="display:inline-block;background-color:rgba(255,255,255,0.15);
                          border-radius:8px;padding:4px 14px;margin-bottom:6px;">
                <span style="color:#E8C766;font-size:18px;font-weight:800;letter-spacing:1px;">
                  ضِيافة
                </span>
              </div>
              <p style="color:#FFFFFF;margin:0;font-size:13px;font-weight:600;">
                تأكيد الحجز
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 16px;">
              <p style="color:#152A24;font-size:15px;margin:0 0 6px;font-weight:700;direction:rtl;text-align:right;">
                أهلاً <bdi dir="ltr" style="display:inline-block;">${userName}</bdi>،
              </p>
              <p style="color:#4A5568;font-size:12px;margin:0 0 16px;line-height:1.6;text-align:right;">
                يسعدنا إعلامك بأن حجزك قد تم تأكيده بنجاح. فيما يلي ملخص إقامتك الكامل:
              </p>

              <!-- Booking Ref Box -->
              <div style="background-color:#F8F4EA;background:linear-gradient(135deg,#F8F4EA 0%,#EDE6D6 100%);
                          border:1.5px solid #C69A3A;border-radius:12px;
                          padding:12px 10px;text-align:center;margin-bottom:16px;">
                <p style="margin:0 0 4px;font-size:10px;color:#8A6A1F;
                           letter-spacing:1px;text-transform:uppercase;font-weight:700;">
                  رقم الحجز
                </p>
                <span style="font-size:14px;font-weight:800;
                              color:#0E5C4A;font-family:'Courier New',monospace;display:block;
                              word-break:break-all;direction:ltr;">
                  ${id}
                </span>
              </div>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#F8F4EA;border-radius:10px;border:1px solid #E5DFC8;margin-bottom:16px;">
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #EDE6D6;text-align:right;" colspan="2">
                    <p style="margin:0 0 2px;font-size:10px;color:#93A29B;font-weight:700;">الفندق</p>
                    <p style="margin:0;font-size:13.5px;font-weight:700;color:#1C2B27;direction:rtl;"><bdi>${hotelName}</bdi></p>
                    <p style="margin:2px 0 0;font-size:11px;color:#52655F;">${city}، ${country}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #EDE6D6;width:50%;border-left:1px solid #EDE6D6;text-align:right;">
                    <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">تسجيل الوصول</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#0E5C4A;direction:ltr;text-align:right;">${checkIn}</p>
                  </td>
                  <td style="padding:10px 12px;border-bottom:1px solid #EDE6D6;width:50%;text-align:right;">
                    <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">تسجيل المغادرة</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#BD5B3E;direction:ltr;text-align:right;">${checkOut}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-left:1px solid #EDE6D6;text-align:right;">
                    <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">عدد الليالي</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#1C2B27;">${nights} ليلة</p>
                  </td>
                  <td style="padding:10px 12px;text-align:right;">
                    <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">عدد الضيوف</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#1C2B27;">${guests} ضيف</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-top:1px solid #EDE6D6;text-align:right;" colspan="2">
                    <p style="margin:0 0 2px;font-size:10px;color:#93A29B;">نوع الغرفة</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:#1C2B27;">${roomLabel}</p>
                  </td>
                </tr>
              </table>

              <!-- Extras Table -->
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#1C2B27;text-align:right;">الإضافات المختارة</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border:1px solid #E5DFC8;border-radius:8px;margin-bottom:16px;">
                <tr style="background-color:#F8F4EA;">
                  <th style="padding:6px 12px;font-size:10px;color:#52655F;text-align:right;border-bottom:1px solid #E5DFC8;">الإضافة</th>
                  <th style="padding:6px 12px;font-size:10px;color:#52655F;text-align:left;border-bottom:1px solid #E5DFC8;">المبلغ</th>
                </tr>
                ${extrasRows}
              </table>

              <!-- Total Card -->
              <div style="background-color:#0E5C4A;background:linear-gradient(135deg,#0E5C4A 0%,#0A4437 100%);
                          border-radius:12px;padding:12px 14px;margin-bottom:16px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="text-align:right;">
                      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);">الإجمالي الكلي</p>
                      <p style="margin:2px 0 0;font-size:18px;font-weight:800;color:#FFFFFF;"><bdi dir="ltr">$${amount.toLocaleString()}</bdi></p>
                      <p style="margin:2px 0 0;font-size:10px;color:#E8C766;">يعادل تقريباً ${formatSYP(amount)} ل.س</p>
                    </td>
                    <td style="text-align:left;vertical-align:middle;">
                      <div style="background-color:rgba(255,255,255,0.15);border-radius:6px;padding:4px 8px;display:inline-block;">
                        <span style="color:#FFFFFF;font-size:10.5px;font-weight:700;">✅ مدفوع ومؤكد</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Warning -->
              <div style="background-color:#FFF8EC;border:1px solid #F5D87A;border-radius:10px;
                          padding:10px 12px;">
                <p style="margin:0;font-size:11px;color:#7A5A00;line-height:1.5;text-align:right;">
                  📌 يرجى الاحتفاظ بهذا البريد كإثبات للحجز وتقديمه عند الوصول للفندق.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F4EA;padding:12px 16px;
                       border-top:1px solid #EDE6D6;text-align:center;">
              <p style="margin:0;font-size:10px;color:#A09484;">
                © ${year} ضيافة - Dhiyafa · جميع الحقوق محفوظة
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/bookings/send-confirmation
// Body: { booking: { ...Booking fields }, userEmail: string }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/send-confirmation', requireAuth, async (req, res) => {
  if (req.user.role !== 'superadmin')
    return res.status(403).json({ success: false, message: 'هذا الإجراء للأدمن فقط.' });

  const { booking, userEmail } = req.body;
  if (!booking || !userEmail)
    return res.status(400).json({ success: false, message: 'booking و userEmail مطلوبان.' });

  if (!isOtpEmail(userEmail))
    return res.status(400).json({ success: false, message: 'هذا الإيميل لا يدعم الإرسال.' });

  try {
    const html = buildConfirmationHtml(booking);
    const { error } = await resend.emails.send({
      from:    FROM,
      to:      userEmail,
      subject: `✅ تأكيد حجزك في ${booking.hotelName} — ${booking.id}`,
      html,
      text: `تأكيد حجزك في ضيافة\nرقم الحجز: ${booking.id}\nالفندق: ${booking.hotelName}\nالوصول: ${booking.checkIn}\nالمغادرة: ${booking.checkOut}\nالمبلغ: $${booking.amount}`,
    });
    if (error) throw new Error(error.message);
    console.log(`[Booking] Confirmation sent to ${userEmail} for ${booking.id}`);
    return res.json({ success: true, message: 'تم إرسال تأكيد الحجز بنجاح.' });
  } catch (err) {
    console.error('[send-confirmation]', err.message);
    return res.status(500).json({ success: false, message: 'فشل إرسال الإيميل.', detail: err.message });
  }
});

module.exports = { router };