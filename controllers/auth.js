const UserValidation = require("../validations/user");
const Auth = require("../models/auth");
const JwtHelper = require("../utils/jwtHelper");
const sendEmail = require("../utils/mailerSmtp");
const { CLIENT_URL } = process.env; // Front-end URL, used for specifying URL on password reset

module.exports = {
  register: async (req, res, next) => {
    try {
      // Validasi input
      await UserValidation.register(req.body);

      // Simpan data user dan hasilkan OTP
      const data = await Auth.register(req.body);

      // Kirim email dengan OTP
      await sendEmail(
        data.email,
        "Verifikasi Akun Baru - Kode OTP Anda",
        `Kode OTP Anda adalah: ${data.otp}. Silakan verifikasi akun Anda dalam waktu 5 menit.`,
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #6A1B9A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #BDBDBD; border-radius: 8px; background-color: #FFFFFF;">
            <h2 style="text-align: center; color: #6A1B9A;">Verifikasi Akun Baru</h2>
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar. Untuk memverifikasi email Anda, masukkan kode berikut:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #FFE082; border: 1px solid #BDBDBD; border-radius: 4px; display: inline-block; color: #6A1B9A;">
                    ${data.otp}
                </span>
            </div>
            <p>Kode ini akan kedaluwarsa dalam <strong>5 menit</strong>. Jika Anda tidak meminta kode ini, abaikan email ini.</p>
            <p>Salam hangat,<br>
            <strong>Tim Tiketku</strong></p>
            <hr style="border: 0; border-top: 1px solid #BDBDBD; margin: 20px 0;">
            <p style="font-size: 12px; color: #6A1B9A;">Jika Anda mengalami masalah, silakan hubungi 
                <a href="mailto:support@example.com" style="color: #6A1B9A;">support@example.com</a>.
            </p>
        </div>`
      );

      return res.status(201).json({
        status: "Success",
        statusCode: 201,
        message: "Registrasi berhasil. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.",
        data: {
          user: {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
  resend: async (req, res, next) => {
    try {
      await UserValidation.resendOtp(req.body);
      const data = await Auth.resendOTP(req.body);

      // Kirim email dengan TOTP baru
      await sendEmail(
        req.body.email,
        "Verifikasi Akun Baru - Kode OTP Anda",
        `Kode OTP Anda adalah: ${data}. Silakan verifikasi akun Anda dalam waktu 5 menit.`,
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #6A1B9A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #BDBDBD; border-radius: 8px; background-color: #FFFFFF;">
            <h2 style="text-align: center; color: #6A1B9A;">Verifikasi Akun Baru</h2>
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar. Untuk memverifikasi email Anda, masukkan kode berikut:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #FFE082; border: 1px solid #BDBDBD; border-radius: 4px; display: inline-block; color: #6A1B9A;">
                    ${data}
                </span>
            </div>
            <p>Kode ini akan kedaluwarsa dalam <strong>5 menit</strong>. Jika Anda tidak meminta kode ini, abaikan email ini.</p>
            <p>Salam hangat,<br>
            <strong>Tim Tiketku</strong></p>
            <hr style="border: 0; border-top: 1px solid #BDBDBD; margin: 20px 0;">
            <p style="font-size: 12px; color: #6A1B9A;">Jika Anda mengalami masalah, silakan hubungi 
                <a href="mailto:support@example.com" style="color: #6A1B9A;">support@example.com</a>.
            </p>
        </div>`
      );

      return res.status(200).json({
        status: "Success",
        statusCode: 200,
        message: "Kode OTP telah berhasil dikirim ulang. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.",
      });
    } catch (err) {
      next(err);
    }
  },
  verify: async (req, res, next) => {
    try {
      await UserValidation.otp(req.body);
      const user = await Auth.verifyOTP(req.body);

      return res.status(201).json({
        status: "Success",
        message: "Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.",
        statusCode: 201,
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      UserValidation.validateLogin(req.body);
      const { email, password } = req.body;
      const user = await Auth.login(email, password);
      const accessToken = JwtHelper.generateToken(user);

      return res.status(200).json({
        status: "Success",
        statusCode: 200,
        message: "Login berhasil.",
        data: {
          user,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },
  logout: (req, res) => {
    const accessToken = Auth.logout();

    return res.status(200).json({
      status: "Success",
      statusCode: 200,
      message: "Logout berhasil. Anda telah keluar dari akun Anda.",
      data: {
        accessToken,
      },
    });
  },
  createPasswordReset: async (req, res, next) => {
    try {
      UserValidation.validateEmail(req.body);
      const { email } = req.body;
      const token = await Auth.createPasswordToken(email);
      const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

      await sendEmail(
        email,
        "Reset Password Anda",
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

      return res.status(200).json({
        status: "Success",
        statusCode: 200,
        message: "Permintaan reset password berhasil. Silakan cek email Anda untuk tautan reset password.",
      });
    } catch (err) {
      next(err);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      UserValidation.validatePasswordReset(req.body);
      const { passwordResetToken, newPassword } = req.body;
      await Auth.resetPassword(passwordResetToken, newPassword);

      return res.status(200).json({
        status: "Success",
        statusCode: 200,
        message: "Password berhasil direset. Silakan login dengan password baru Anda.",
      });
    } catch (err) {
      next(err);
    }
  },
  authenticate: async (req, res, next) => {
    try {
      UserValidation.headers(req.headers);

      const user = await Auth.authenticate(req.headers.authorization);

      return res.status(200).json({
        status: "Success",
        statusCode: 200,
        message: "Token valid. Pengguna terautentikasi.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  handleOauth: async (req, res, next) => {
    try {
      const { email } = req.user;
      console.log(email);
      const result = await Auth.handleOauth(email);
      res.status(200).json({
        message: "Login berhasil",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
