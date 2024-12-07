const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const HttpRequestError = require('../utils/error');
const JwtHelper = require('../utils/jwtHelper');
const prisma = new PrismaClient()

class Auth {
    static async login(email, password) {
        const user = await prisma.user.findUnique({
            where: {email},
        })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new HttpRequestError('Email atau kata sandi yang Anda masukkan salah.', 401);
        }

        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
        };
    }

    static logout(){
        return JwtHelper.signOut();
    }

    static async createPasswordToken(email) {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new HttpRequestError('Email tidak terdaftar. Pastikan email yang Anda masukkan benar.', 400)
        }

        const token = crypto.randomBytes(32).toString('hex')
        const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000) // Token expires in 10 minutes

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordResetToken: hashedResetToken,
                passwordResetTokenExpirationTime: expirationTime,
            },
        })

        return token;
    }

    static async resetPassword (token, newPassword){
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpirationTime: {
                    gte: new Date(Date.now())
                },
            },
        });

        if (!user) {
            throw new HttpRequestError('Token reset password tidak valid atau telah kedaluwarsa. Silakan lakukan permintaan reset password kembali.', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetTokenExpirationTime: null,
            },
        });
    }
}
module.exports = Auth;
