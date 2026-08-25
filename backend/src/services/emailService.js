/**
 * backend/src/services/emailService.js
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // استخدام المعرف المباشر لخدمة Gmail بدلاً من host/port
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App Password المكون من 16 حرفاً
  },
  pool: true, // تفعيل Pool لمنع فتح وإغلاق اتصالات جديدة في كل طلب
  maxConnections: 5,
  maxMessages: 100,
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000,
});

async function sendOtpEmail(toEmail, toName, otp, expiryMin = 10) {
  const fromName = process.env.MAIL_FROM_NAME || 'ضيافة - Dhiyafa';

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F3EEE1;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE1;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0"
      style="max-width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(29,45,40,.12);border:1px solid #EDE6D6;">
      <tr>
        <td style="background:linear-gradient(135deg,#0E5C4A,#0A4437);padding:28px 36px 24px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:6px 18px;margin-bottom:10px;">
            <span style="color:#E8C766;font-size:22px;font-weight:900;letter-spacing:1px;">ضِيافة</span>
          </div>
          <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px;font-weight:600;">رمز التحقق لإنشاء حسابك</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 36px 0;">
          <p style="color:#152A24;font-size:16px;margin:0 0 6px;font-weight:700;">أهلاً ${toName}،</p>
          <p style="color:#4A5568;font-size:13px;margin:0;line-height:1.8;">
            استخدم الرمز التالي لإتمام إنشاء حسابك في منصة <strong>ضيافة</strong>.
            الرمز صالح لمدة <strong>${expiryMin} دقائق</strong> فقط.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px 0;">
          <div style="background:linear-gradient(135deg,#F8F4EA,#EDE6D6);border:2px solid #C69A3A;border-radius:14px;padding:20px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#8A6A1F;letter-spacing:2px;text-transform:uppercase;font-weight:700;">رمز التحقق — OTP</p>
            <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#0E5C4A;font-family:'Courier New',monospace;display:block;padding:4px 0;">${otp}</span>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px 28px;">
          <div style="background:#FFF8EC;border:1px solid #F5D87A;border-radius:10px;padding:12px 16px;">
            <p style="margin:0;font-size:12px;color:#7A5A00;line-height:1.7;">⚠️ لا تشارك هذا الرمز مع أي شخص. فريق ضيافة لن يطلب منك هذا الرمز أبداً.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background:#F8F4EA;padding:14px 36px;border-top:1px solid #EDE6D6;text-align:center;">
          <p style="margin:0;font-size:11px;color:#A09484;">© ${new Date().getFullYear()} ضيافة - Dhiyafa · جميع الحقوق محفوظة</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  return await transporter.sendMail({
    from: `"${fromName}" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — رمز التحقق لحسابك في ضيافة`,
    html,
    text: `أهلاً ${toName}،\n\nرمز التحقق: ${otp}\nصالح لمدة ${expiryMin} دقائق.\n\nلا تشاركه مع أحد.\n\nفريق ضيافة`,
  });
}

async function sendBookingConfirmationEmail(toEmail, booking, htmlContent) {
  const fromName = process.env.MAIL_FROM_NAME || 'ضيافة - Dhiyafa';

  return await transporter.sendMail({
    from: `"${fromName}" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `✅ تأكيد حجزك في ${booking.hotelName} — ${booking.id}`,
    html: htmlContent,
    text: `تأكيد حجزك في ضيافة\nرقم الحجز: ${booking.id}\nالفندق: ${booking.hotelName}\nالوصول: ${booking.checkIn}\nالمغادرة: ${booking.checkOut}\nالمبلغ: $${booking.amount}`,
  });
}

module.exports = { sendOtpEmail, sendBookingConfirmationEmail };