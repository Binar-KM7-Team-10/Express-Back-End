const transporter = require('../configs/mailer');

module.exports = async (to, subject, text, html) => {
    await transporter.sendMail({
        from: `Tiketku support <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    });
};