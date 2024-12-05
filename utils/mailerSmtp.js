const transporter = require('../configs/mailer');

const sendEmail = async (to, subject, text, otp) => {
    const mailOptions = {
        from: `Tiketku support <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #6A1B9A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #BDBDBD; border-radius: 8px; background-color: #FFFFFF;">
            <h2 style="text-align: center; color: #6A1B9A;">Verifikasi Akun Baru</h2>
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar. Untuk memverifikasi email Anda, masukkan kode berikut:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #FFE082; border: 1px solid #BDBDBD; border-radius: 4px; display: inline-block; color: #6A1B9A;">
                    ${otp}
                </span>
            </div>
            <p>Kode ini akan kedaluwarsa dalam <strong>60 detik</strong>. Jika Anda tidak meminta kode ini, abaikan email ini.</p>
            <p>Salam hangat,<br>
            <strong>Tim Tiketku</strong></p>
            <hr style="border: 0; border-top: 1px solid #BDBDBD; margin: 20px 0;">
            <p style="font-size: 12px; color: #6A1B9A;">Jika Anda mengalami masalah, silakan hubungi 
                <a href="mailto:support@example.com" style="color: #6A1B9A;">support@example.com</a>.
            </p>
        </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };