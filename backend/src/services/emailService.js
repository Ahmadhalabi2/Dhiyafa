/**
 * emailService.js
 * ─────────────────────────────────────────────────────
 * إرسال OTP عبر Gmail SMTP باستخدام Nodemailer.
 * يدعم أي إيميل وجهة (Gmail, Yahoo, Outlook, …)
 * ─────────────────────────────────────────────────────
 */

const nodemailer = require('nodemailer');

/** Transporter — يُنشأ مرة واحدة ويُعاد استخدامه */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Google App Password (16 حرف)
  },
});

/**
 * إرسال رمز OTP بتصميم HTML أنيق.
 * @param {string} toEmail   - إيميل المستلم
 * @param {string} toName    - اسم المستلم
 * @param {string} otp       - الرمز المكوّن من 6 أرقام
 * @param {number} expiryMin - مدة الصلاحية بالدقائق
 */
async function sendOtpEmail(toEmail, toName, otp, expiryMin = 10) {
  const fromName = process.env.MAIL_FROM_NAME || 'ضيافة - Dhiyafa';

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>رمز التحقق - ضيافة</title>
  <style>
    @media only screen and (max-width: 540px) {
      .main-table { width: 100% !important; }
      .otp-code   { font-size: 32px !important; letter-spacing: 8px !important; }
      .body-pad   { padding: 24px 20px !important; }
      .header-pad { padding: 24px 20px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F3EEE1;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table class="main-table" width="480" cellpadding="0" cellspacing="0"
               style="width:480px;max-width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;
                      box-shadow:0 8px 32px rgba(29,45,40,0.12);border:1px solid #EDE6D6;">

          <!-- Header -->
          <tr>
            <td class="header-pad" style="background:linear-gradient(135deg,#0E5C4A 0%,#0A4437 100%);
                        padding:28px 36px 24px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);
                          border-radius:10px;padding:6px 16px;margin-bottom:10px;">
                <span style="color:#E8C766;font-size:20px;font-weight:800;letter-spacing:1px;">
                  ضِيافة
                </span>
              </div>
              <p style="color:rgba(255,255,255,0.85);margin:0;font-size:13px;">
                رمز التحقق لإنشاء حسابك
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="body-pad" style="padding:28px 36px 24px;">
              <p style="color:#152A24;font-size:15px;margin:0 0 6px;font-weight:600;">
                أهلاً ${toName}،
              </p>
              <p style="color:#4A5568;font-size:13px;margin:0 0 24px;line-height:1.8;">
                استخدم الرمز التالي لإتمام إنشاء حسابك في منصة <strong>ضيافة</strong>.
                الرمز صالح لمدة <strong>${expiryMin} دقائق</strong> فقط.
              </p>

              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#F8F4EA 0%,#EDE6D6 100%);
                          border:2px solid #C69A3A;border-radius:14px;
                          padding:20px 16px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:11px;color:#8A6A1F;
                           letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                  رمز التحقق — OTP
                </p>
                <span class="otp-code" style="font-size:38px;font-weight:900;letter-spacing:10px;
                              color:#0E5C4A;font-family:'Courier New',monospace;display:block;
                              line-height:1.2;padding:4px 0;">
                  ${otp}
                </span>
              </div>

              <!-- Warning -->
              <div style="background:#FFF8EC;border:1px solid #F5D87A;border-radius:10px;
                           padding:12px 16px;margin-bottom:18px;">
                <p style="margin:0;font-size:12px;color:#7A5A00;line-height:1.7;">
                  ⚠️ لا تشارك هذا الرمز مع أي شخص. فريق ضيافة لن يطلب منك هذا الرمز أبداً.
                </p>
              </div>

              <p style="color:#8A968F;font-size:12px;margin:0;line-height:1.6;">
                إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد بأمان.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8F4EA;padding:14px 36px;
                        border-top:1px solid #EDE6D6;text-align:center;">
              <p style="margin:0;font-size:11px;color:#A09484;">
                © ${new Date().getFullYear()} ضيافة - Dhiyafa · جميع الحقوق محفوظة
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — رمز التحقق لحسابك في ضيافة`,
    html,
    // نص احتياطي plain-text لعملاء البريد القديمة
    text: `أهلاً ${toName}،\n\nرمز التحقق الخاص بك: ${otp}\nصالح لمدة ${expiryMin} دقائق.\n\nلا تشاركه مع أحد.\n\nفريق ضيافة`,
  });
}

module.exports = { sendOtpEmail };
