const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateTOTP, generateSecret, verifyTOTP } = require("../utils/totp");
const HttpRequestError = require('../utils/error');
const prisma = new PrismaClient();

module.exports = {
    register: async ({ fullName, email, password, phoneNumber }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpSecret = generateSecret();
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                phoneNumber,
                isVerified: false,
                otpSecret,
            },
        });

        const otp = generateTOTP(otpSecret);

        return { ...user, otp };
    },
    findByEmail: async (email) => {
        const isExistedEmail = await prisma.user.findUnique({
            where: {
                email
            }
        }) || false;

        return isExistedEmail;
    },
    verifyOTP: async ({ email, otp }) => {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        
        if (!user){
            throw new HttpRequestError("Email tidak terdaftar. Silahkan melakukan registrasi akun terlebih dahulu.", 400);
        }
    
        if (user && user.isVerified) {
            throw new HttpRequestError("Email sudah terdaftar. Silahkan login menggunakan email ini atau registrasi akun baru menggunakan email lain.", 400);
        }

        
        const isValid = verifyTOTP(otp, user.otpSecret);

        if (!isValid) {
            throw new HttpRequestError("Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa.", 400);
        }

        // Update status user menjadi terverifikasi
        await prisma.user.update({
            where: {
                email
            },
            data: {
                isVerified: true
            },
        });

        return user;
    },
    resendOTP: async ({ email }) => {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        const otp = generateTOTP(user.otpSecret);

        return otp;
    },
}
