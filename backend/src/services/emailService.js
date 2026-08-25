/**
 * emailService.js — Resend version
 * يرسل OTP وتأكيد الحجز عبر Resend API
 */

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// المرسِل — لازم يكون domain مسجّل على Resend أو onboarding@resend.dev للتجربة
const FROM = process.env.MAIL_FROM
  ? `${process.env.MAIL_FROM_NAME || 'ضيافة'} <${process.env.MAIL_FROM}>`
  : 'ضيافة - Dhiyafa <onboarding@resend.dev>';

async function sendOtpEmail(toEmail, toName, otp, expiryMin = 10) {
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#F3EEE1;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EEE1;padding:16px 0;">
  <tr>
    <td align="center" style="padding:0 8px;">
      <!-- Container Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:420px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(29,45,40,.08);border:1px solid #EDE6D6;margin:0 auto;">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0E5C4A,#0A4437);padding:20px 16px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:8px;padding:4px 14px;margin-bottom:6px;">
              <span style="color:#E8C766;font-size:18px;font-weight:900;">ضِيافة</span>
            </div>
            <p style="color:rgba(255,255,255,.9);margin:0;font-size:13px;font-weight:600;">رمز التحقق لإنشاء حسابك</p>
          </td>
        </tr>

        <!-- Greeting & Content -->
        <tr>
          <td style="padding:18px 16px 0;">
            <p style="color:#152A24;font-size:15px;margin:0 0 4px;font-weight:700;">أهلاً ${toName}،</p>
            <p style="color:#4A5568;font-size:12px;margin:0;line-height:1.6;">
              استخدم الرمز التالي لإتمام إنشاء حسابك. صالح لمدة <strong>${expiryMin} دقائق</strong>.
            </p>
          </td>
        </tr>

        <!-- OTP Box -->
        <tr>
          <td style="padding:14px 16px 0;">
            <div style="background:linear-gradient(135deg,#F8F4EA,#EDE6D6);border:1.5px solid #C69A3A;border-radius:12px;padding:14px;text-align:center;">
              <p style="margin:0 0 4px;font-size:10px;color:#8A6A1F;letter-spacing:1px;text-transform:uppercase;font-weight:700;">رمز التحقق</p>
              <span style="font-size:32px;font-weight:900;letter-spacing:6px;color:#0E5C4A;font-family:'Courier New',monospace;display:inline-block;direction:ltr;">${otp}</span>
            </div>
          </td>
        </tr>

        <!-- Warning Box -->
        <tr>
          <td style="padding:14px 16px;">
            <div style="background:#FFF8EC;border:1px solid #F5D87A;border-radius:8px;padding:10px 12px;">
              <p style="margin:0;font-size:11px;color:#7A5A00;line-height:1.5;">⚠️ لا تشارك هذا الرمز مع أي شخص.</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8F4EA;padding:12px 16px;border-top:1px solid #EDE6D6;text-align:center;">
            <p style="margin:0;font-size:10px;color:#A09484;">© ${new Date().getFullYear()} ضيافة - Dhiyafa</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      toEmail,
    subject: `${otp} — رمز التحقق لحسابك في ضيافة`,
    html,
    text: `أهلاً ${toName}،\n\nرمز التحقق: ${otp}\nصالح لمدة ${expiryMin} دقائق.\n\nفريق ضيافة`,
  });

  if (error) throw new Error(error.message);
}

module.exports = { sendOtpEmail };