const HttpRequestError = require("../utils/error");
const User = require("../models/auth");

module.exports = {
  register: async ({ fullName, email, password, phoneNumber }) => {
    if (!fullName || !email || !password || !phoneNumber) {
      throw new HttpRequestError("Validasi gagal. Pastikan email, phoneNumber, fullName, dan password telah diisi.", 400);
    }

    if (typeof fullName !== "string" || typeof email !== "string" || typeof password !== "string" || typeof phoneNumber !== "string") {
      throw new HttpRequestError("Validasi gagal. email, phoneNumber, fullName, dan password harus berupa string.", 400);
    }

    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      throw new HttpRequestError("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.", 400);
    }

    if (!phoneNumber.startsWith("628") || phoneNumber.length < 11 || phoneNumber.length > 15) {
      throw new HttpRequestError("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.", 400);
    }

    const isExistedEmail = await User.findByEmail(email);

    if (isExistedEmail) {
      throw new HttpRequestError("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.", 409);
    }

    if (password.length < 8 || password.length > 70) {
      throw new HttpRequestError("Validasi gagal. password harus memiliki 8 hingga 70 digit.", 400);
    }
  },
  otp: async ({ otp, email }) => {
    if (!email || !otp) {
      throw new HttpRequestError("Validasi gagal. Pastikan email dan otp telah diisi.", 400);
    }

    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        throw new HttpRequestError("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.", 400);
    }
    
    if (typeof otp !== "string") {
      throw new HttpRequestError("Validasi gagal. OTP harus berupa string.", 400);
    }

    if (!otp.match(/^[0-9]*$/)) {
      throw new HttpRequestError("Validasi gagal. OTP harus berisikan angka.", 400);
    }
    
    if (otp.length !== 6) {
      throw new HttpRequestError("Validasi gagal, OTP harus berisikan 6 digit angka.", 400);
    }
  },
  resendOtp: async ({ email }) => {
    if (!email) {
      throw new HttpRequestError("Validasi gagal. Pastikan email telah diisi.", 400);
    }

    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        throw new HttpRequestError("Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.", 400);
    }

    const isExistedEmail = await User.findByEmail(email);

    if (isExistedEmail && isExistedEmail.isVerified) {
      throw new HttpRequestError("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.", 409);
    }

    if (!isExistedEmail) {
      throw new HttpRequestError("Email tidak terdaftar. Silahkan melakukan registrasi akun terlebih dahulu.", 400);
    }
  },
  validateLogin: (data) => {
      const { email, password } = data;
  
      if (!email || !password) {
          throw new HttpRequestError('Validasi gagal. Pastikan email dan password telah diisi.', 400);
      }
  
      if (typeof email !== 'string' || typeof password !== 'string') {
          throw new HttpRequestError('Validasi gagal. email dan password harus berupa string.', 400);
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
      }
  
      if (password.length < 8 || password.length > 70) {
          throw new HttpRequestError('Validasi gagal. password harus memiliki 8 hingga 70 digit.', 400);
      }
  },
  validateEmail: (data) => {
      const { email } = data;
  
      if (!email) {
          throw new HttpRequestError('Validasi gagal. Pastikan email telah diisi.', 400);
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
      }
  },
  validatePasswordReset: (data) => {
      const { passwordResetToken, newPassword, confirmNewPassword } = data;
  
      if (!passwordResetToken || !newPassword || !confirmNewPassword) {
          throw new HttpRequestError('Validasi gagal. Pastikan passwordResetToken, newPassword, dan confirmNewPassword telah diisi.', 400);
      }
  
      if (typeof passwordResetToken !== 'string' || typeof newPassword !== 'string' || typeof confirmNewPassword !== 'string') {
          throw new HttpRequestError('Validasi gagal. passwordResetToken, newPassword, dan confirmNewPassword harus berupa string.', 400);
      }
  
      if (newPassword.length < 8 || newPassword.length > 70) {
          throw new HttpRequestError('Password tidak valid. Pastikan password memiliki antara 8 hingga 70 karakter.', 400);
      }
  
      if (newPassword !== confirmNewPassword) {
          throw new HttpRequestError('Validasi gagal. Pastikan newPassword dan confirmNewPassword sama.', 400);
      }
  }
};