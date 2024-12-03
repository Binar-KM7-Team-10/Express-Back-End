const UserValidation = require("../validations/user");
const User = require("../models/auth");
const { generateTOTP } = require("../utils/totp");
const { sendEmail } = require("../utils/mailerSmtp");
const HttpRequestError = require("../utils/error");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  register: async (req, res, next) => {
    try {
      // Validasi input
      await UserValidation.register(req.body);

      // Simpan data user dan hasilkan OTP
      const data = await User.register(req.body);

      // Kirim email dengan OTP
      await sendEmail(data.email, "Email Verification", `Your TOTP code is: ${data.otp}. Please verify your account within 60 seconds.`);

      return res.status(201).json({
        status : "Success",
        statusCode: 201,
        message: "Successfully registered. Check your email for the OTP.",
        data: {
          user: {
            user : ,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
  resend: async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate TOTP baru
      const otp = generateTOTP(user.secret);

      // Kirim email dengan TOTP baru
      await sendEmail(email, "Resend OTP", `Your new TOTP code is: ${otp}. Please verify your account within 60 seconds.`);

      res.status(200).json({ message: "New TOTP sent to email." });
    } catch (err) {
      next(err);
    }
  },
  verify: async (req, res, next) => {
    try {
      const { otp, email } = req.body;

      
      await UserValidation.otp(req.body);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user){
        throw HttpRequestError("User not found", 404);
      }

      // Verifikasi TOTP menggunakan secret dari database
      const isValid = verifyTOTP(otp, user.secret);
      if (!isValid) {
        throw HttpRequestError("Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa.", 400);
      }

      // Update status user menjadi terverifikasi
      await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });

      res.status(201).json({ 
        message: "Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.",
        statusCode: 201,
        data : {
            "user" :{
                "id" : user.id,
                "fullName" : user.fullName,
                "email" : user.email,
                "phoneNumber" : user.phoneNumber
            }
        }
    });
    } catch (err) {
      next(err);
    }
  },
};
