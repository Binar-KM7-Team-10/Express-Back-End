const UserValidations = require ('../validations/user')
const Auth = require('../models/auth')
const JwtHelper = require('../utils/jwtHelper');
const sendEmail = require('../utils/mailerSmtp');

module.exports = {
    login: async (req, res, next) => {
        try {
            UserValidations.validateLogin(req.body); 
            const { email, password } = req.body;
            const user = await Auth.login(email, password);
            const accessToken = JwtHelper.generateToken(user);
    
            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Login berhasil.',
                data: {
                    user,
                    accessToken
                }
            });
        } catch (err) {
            next(err);
        }
    },
    logout: (req, res) => {
        const accessToken = Auth.logout();
        
        return res.status(200).json({
            status: 'Success',
            statusCode: 200,
            message: 'Logout berhasil. Anda telah keluar dari akun Anda.',
            data: {
                accessToken
            }
        });
    },
    createPasswordReset: async (req, res, next) => {
        try {
            UserValidations.validateEmail(req.body)
            const { email } = req.body
            const token = await Auth.createPasswordToken(email);
            const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;

            await sendEmail(
                email,
                'Reset Password Anda',
                `Klik tautan berikut untuk mengatur ulang kata sandi Anda: ${resetUrl}`,
                `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #6A1B9A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #BDBDBD; border-radius: 8px; background-color: #FFFFFF;">
                    <h2 style="text-align: center; color: #6A1B9A;">Reset Password Anda</h2>
                    <p>Halo,</p>
                    <p>Anda menerima email ini karena ada permintaan untuk mengatur ulang kata sandi akun Anda. Klik tautan di bawah ini untuk mengatur ulang kata sandi Anda:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetUrl}" style="font-size: 18px; font-weight: bold; padding: 10px 20px; background-color: #6A1B9A; border: none; border-radius: 4px; text-decoration: none; color: #FFFFFF; display: inline-block;">
                            Reset Kata Sandi
                        </a>
                    </div>
                    <p>Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini. Tautan ini hanya berlaku selama <strong>10 menit</strong>.</p>
                    <p>Salam hangat,<br>
                    <strong>Tim Tiketku</strong></p>
                    <hr style="border: 0; border-top: 1px solid #BDBDBD; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6A1B9A;">Jika Anda mengalami masalah dengan tautan, salin dan tempel URL di bawah ini ke peramban Anda:<br>
                        <a href="${resetUrl}" style="color: #6A1B9A;">${resetUrl}</a>
                    </p>
                    <p style="font-size: 12px; color: #6A1B9A;">Untuk bantuan lebih lanjut, silakan hubungi 
                        <a href="mailto:support@example.com" style="color: #6A1B9A;">support@example.com</a>.
                    </p>
                </div>`
            );

            return res.status (200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Permintaan reset password berhasil. Silakan cek email Anda untuk tautan reset password.',
            });
        } catch (err) {
            next(err)
        }
    },
    resetPassword: async (req, res, next) =>{
        try {
            UserValidations.validatePasswordReset(req.body);
            const { passwordResetToken, newPassword } = req.body;
            await Auth.resetPassword(passwordResetToken, newPassword);

            return res.status (200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Password berhasil direset. Silakan login dengan password baru Anda.',
            });
        } catch (err) {
            next(err);
        }
    }
}