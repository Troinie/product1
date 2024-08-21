// cài mã OTP đến email
const nodemailer = require('nodemailer');

module.exports.sendMail = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // ở gmail phần mk ứng dụng
        }
    });

    const mailOptions = {
        from: 'dangtruong2k4@gmail.com',
        to: email,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

};