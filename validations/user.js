const HttpRequestError = require("../utils/error");
const User = require("../models/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  },
  create: async (data) => {
      const {fullName, email, phoneNumber, password, role, googleId } = data;
  
      // VALIDASI INPUT
      if(!fullName || !email || !phoneNumber || !password || !role){
          throw new HttpRequestError('Validasi gagal. Pastikan fullName, email, phoneNumber, password, dan role telah diisi.', 400);
      }
  
      if (typeof fullName !== 'string' ||
          typeof email !== 'string' ||
          typeof phoneNumber !== 'string' ||
          typeof password !== 'string' ||
          typeof role !== 'string' ||
          googleId && typeof googleId !== 'string'
      ){
          throw new HttpRequestError('Validasi gagal. email, phoneNumber, fullName, password, googleId, dan role harus berupa string.', 400);
      }
  
      // VALIDASI EMAIL
      const findEmail = await prisma.user.findUnique({
          where: {email: email}
      })
  
      if (findEmail){
          throw new HttpRequestError("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.", 409);
      }
  
      if (!email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )) {
          throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
      }
      // VALIDASI PHONE NUMBER
      if (!phoneNumber.startsWith("628") || phoneNumber.length < 11 || phoneNumber.length > 15){
          throw new HttpRequestError("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.", 400);
      }
  
      const isPhoneNumber = await prisma.user.findUnique({
          where: {
              phoneNumber
          }
      });
  
      if (isPhoneNumber) {
          throw new HttpRequestError("Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.", 409);
      }
  
      // VALIDASI PASSWORD
      if (password.length < 8 || password.length > 70){
          throw new HttpRequestError("Validasi gagal. password harus memiliki 8 hingga 70 digit.", 400);
      }
  
      const roleOptions = ['Buyer', 'Admin'];
      if (!roleOptions.includes(role)) {
          throw new HttpRequestError("Validasi gagal. Pastikan role memiliki nilai \'Buyer\' atau \'Admin\'.", 400);
      }
  },
  validateId: async (data) => {
      const { id } = data;
  
      if(!id){
          throw new HttpRequestError("Validasi gagal. Pastikan userId telah diisi.", 400);
      }else if (isNaN(id)){
          throw new HttpRequestError("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.", 400);
      }
  
      const findUserId = await prisma.user.findUnique({
          where: {
              id: parseInt(id)
          }
      });
  
      if (!findUserId){
          throw new HttpRequestError("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.", 404);
      }
  },
  patch: async (data) => {
      const { fullName, email, phoneNumber, password } = data;
  
      //VALIDASI INPUT
      if(!fullName && !email && !phoneNumber && !password){
          throw new HttpRequestError('Validasi gagal. Pastikan terdapat paling tidak satu field untuk diubah.', 400);
      }
  
      if (fullName && typeof fullName !== 'string' ||
          email && typeof email !== 'string' ||
          phoneNumber && typeof phoneNumber !== 'string' ||
          password && typeof password !== 'string'
      ){
          throw new HttpRequestError('Validasi gagal. email, phoneNumber, fullName, dan password harus berupa string.', 400);
      }
  
       // VALIDASI EMAIL
      if (email) {
          const findEmail = await prisma.user.findUnique({
              where: {email: email}
          })
  
          if (findEmail){
              throw new HttpRequestError("Email sudah terdaftar. Silakan gunakan email lain.", 409);
          }
  
          if (!email.match(
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )) {
              throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
          }
      }
  
      // VALIDASI PHONE NUMBER
      if (phoneNumber) {
          if (!phoneNumber.startsWith("628") || phoneNumber.length < 11 || phoneNumber.length > 15){
              throw new HttpRequestError("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.", 400);
          }
  
          const isPhoneNumber = await prisma.user.findUnique({
              where: {
                  phoneNumber
              }
          });
  
          if (isPhoneNumber) {
              throw new HttpRequestError("Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.", 409);
          }
      }
  
      if (password && (password.length < 8 || password.length > 70)){
          throw new HttpRequestError("Validasi gagal. password harus memiliki 8 hingga 70 digit.", 400);
      }
  },
  headers: ({ authorization }) => {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new HttpRequestError(
        "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.",
        401
      );
    }
  },
};