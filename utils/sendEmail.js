/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  // creating a transporter and connecting to the email service
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // defining the email options
  const mailOptions = {
    from: 'Shadab Iqbal <shadabiqbalmu@gmail.com>',
    to,
    subject,
    text
  };

  // sending the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
