const { totp, authenticator } = require('otplib');

totp.options = {
    step: 60,
    digit: 6,
};

// Generate TOTP
const generateTOTP = (secret) => totp.generate(secret);

// genereate secret
const generateSecret = () => authenticator.generateSecret();

// Verifikasi TOTP
const verifyTOTP = (token, secret) => totp.check(token, secret);

module.exports = { generateTOTP, verifyTOTP, generateSecret };
