/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');

const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Shadab Iqbal <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Mailgun for production
      return nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
    }

    // Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(fileName, subject) {
    // 1) Read the HTML file
    const filePath = `${__dirname}/../templates/${fileName}`;
    let html = fs.readFileSync(filePath, 'utf-8');

    // Replace placeholders in the HTML with dynamic values
    html = html
      .replace('{{firstName}}', this.firstName)
      .replace('{{URL}}', this.url)
      .replace('{{subject}}', subject);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome.html', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'password_reset.html',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
