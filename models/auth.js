const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {sendEmail} = require('../utils/emailHelper');
const { error } = require('console');
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

    static async createPasswordToken (email){
        const user = await prisma.user.findUnique({
            where: {email}
        })
        if (!user) throw new error ('User not found')
            const token = crypto.randomBytes(32).toString('hex')
        const expirationTime = new Date(Date.now() + 3600 * 1000)

        await prisma.user.update({
            where: {id: user.id},
            data: {
                passwordResetToken: token,
                passwordResetTokenExpirationTime: expirationTime,
            },
        })
        await sendEmail(
            email,
            'password Reset',
            `Your reset token: ${token}`
        )
        return token
    }
    static async resetPassword (token, newPassword){
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetTokenExpirationTime: {gte: new Date()},
            },
        })
        if (!user) throw new Error('Invalid or expired token')
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: {id: user.id},
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetTokenExpirationTime: null,
            },
        })

        return 'Password updated succesfully'
    }
}
module.exports = Auth;
