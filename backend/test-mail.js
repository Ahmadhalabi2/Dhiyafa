require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS length:', process.env.MAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ Connection failed:');
    console.error(error.message);
    console.error('\nFull error:', error);
  } else {
    console.log('\n✅ Gmail SMTP connection successful! Ready to send.');
  }
});
