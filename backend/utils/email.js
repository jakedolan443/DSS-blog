// email.js
//
// Purpose: email utilities
//
// Authors: Jake Dolan
// Date: 14/05/2025

require('dotenv').config();
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  }
});


async function send2FACode(address, code) {
    console.log("Attempting to send OTP code to " + address);

    const mailOptions = {
        from: MAIL_USER,
        to: address,
        subject: "SMS Code",
        text: code
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return true;
    } catch (error) {
        console.log('Error:', error);
        return false;
    }
}


module.exports = { send2FACode };
