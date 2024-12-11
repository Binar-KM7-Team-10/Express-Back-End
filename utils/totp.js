const { totp, authenticator } = require('otplib');

totp.options = {
    step: 500,
    window: 1,
    digit: 6
};

// Generate TOTP
const generateTOTP = (secret) => totp.generate(secret);

//genereate secret
const generateSecret = () => {
    return authenticator.generateSecret();
};

// Verifikasi TOTP
const verifyTOTP = (token, secret) => {
    return totp.check(token, secret);
};

module.exports = { generateTOTP, verifyTOTP, generateSecret };
