const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS
    }
});

module.exports = async (email, subject, message) => {
    await transporter.sendMail({
        from:`${process.env.EMAIL_NAME} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: message
    });
};
