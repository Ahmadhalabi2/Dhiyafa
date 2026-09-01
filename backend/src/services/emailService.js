/**
 * services/emailService.js
 */

const nodemailer = require('nodemailer');

// إنشاء المشغل (Transporter) بإعدادات محسّنة لتفادي Timeout
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App Password المكون من 16 حرفاً
  },
  pool: true,
  maxConnections: 1,
  rateLimit: 1,
  connectionTimeout: 10000, // 10 ثوانٍ كحد أقصى للاتصال
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false, // تجنب مشاكل الشهادات
  },
});

/**
 * دالة إرسال رمز التحقق OTP عبر البريد الإلكتروني
 */
async function sendOtpEmail(toEmail, userName, otpCode, expiryMinutes = 10) {
  const mailOptions = {
    from: `"نُزُل" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `${otpCode} هو رمز التحقق الخاص بك — نُزُل`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">مرحباً ${userName || 'عزيزنا المستخدم'} 👋</h2>
        <p style="font-size: 16px;">شُكراً لتسجيلك في منصة <strong>نُزُل</strong>.</p>
        <p style="font-size: 16px;">رمز التحقق الخاص بك لإنشاء الحساب هو:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f2f2f2; border: 1px dashed #2c3e50; padding: 12px 24px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #16a085; border-radius: 6px;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #7f8c8d;">هذا الرمز صالحة لمدة <strong>${expiryMinutes} دقائق</strong> فقط.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #95a5a6; text-align: center;">إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بآمان.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * دالة إرسال رمز إعادة تعيين كلمة المرور
 */
async function sendPasswordResetEmail(toEmail, userName, otpCode, expiryMinutes = 10) {
  const mailOptions = {
    from: `"نُزُل" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `${otpCode} رمز إعادة تعيين كلمة المرور — نُزُل`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">إعادة تعيين كلمة المرور 🔐</h2>
        <p style="font-size: 16px;">مرحباً <strong>${userName || 'عزيزنا المستخدم'}</strong>،</p>
        <p style="font-size: 16px;">تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>نُزُل</strong>.</p>
        <p style="font-size: 16px;">رمز التحقق لإعادة التعيين هو:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f2f2f2; border: 1px dashed #c0392b; padding: 12px 24px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #c0392b; border-radius: 6px;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #7f8c8d;">هذا الرمز صالح لمدة <strong>${expiryMinutes} دقائق</strong> فقط.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #95a5a6; text-align: center;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. حسابك لن يتأثر.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
};