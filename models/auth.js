const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const HttpRequestError = require('../utils/error');
const prisma = new PrismaClient();
const {generateTOTP, generateSecret} = require("../utils/totp");



module.exports = {
    register: async ({ fullName, email, password, phoneNumber }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        // const secret = email + Date.now(); // Kombinasi email dan timestamp
        const otpSecret = generateSecret();
        await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                phoneNumber,
                isVerified: false,
                otpSecret,
            },
        });

        const otp = generateTOTP(secret);

        return { email: user.email, otp };
    },
}
