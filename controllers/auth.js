const UserValidation = require("../validations/user");
const Auth = require("../models/auth");
const { generateTOTP } = require("../utils/totp");
const { sendEmail } = require("../utils/mailerSmtp");

module.exports = {
  register: async (req, res, next) => {
    try {
      // Validasi input
      await UserValidation.register(req.body);

      // Simpan data user dan hasilkan OTP
      const data = await Auth.register(req.body);

      // Kirim email dengan OTP
      await sendEmail(data.email, "Verifikasi Akun Baru - Kode OTP Anda", `Kode TOTP Anda adalah: ${data.otp}. Silakan verifikasi akun Anda dalam waktu 60 detik.`, data.otp);

      return res.status(201).json({
        status : "Success",
        statusCode: 201,
        message: "Registrasi berhasil. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.",
        data: {
          user: {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber
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
      await sendEmail(req.body.email, "Verifikasi Akun Baru - Kode OTP Anda", `Kode TOTP Anda adalah: ${data}. Silakan verifikasi akun Anda dalam waktu 60 detik.`, data);

      return res.status(200).json({
        status: 'Success',
        statusCode: 200,
        message: 'Kode OTP telah berhasil dikirim ulang. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.'
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
        status: 'Success',
        message: "Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.",
        statusCode: 201,
        data: {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        }
      });
    } catch (err) {
      next(err);
    }
  },
};
