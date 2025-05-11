// test-email.js
const nodemailer = require('nodemailer');

console.log("testing ...")

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});


transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: process.env.RECEIVING_EMAIL,
  subject: 'Test Email',
  text: 'This is a test email'
}, (err, info) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Email sent:', info.response);
  }
});