const { authenticator } = require('otplib');
const { totp } = authenticator;

// Konfigurasi TOTP
totp.options = { step: 60, digits: 6 }; // ini yang ngehasilin 6 angka dan 60 detik

// Generate TOTP
const generateTOTP = (secret) => totp.generate(secret);

//genereate secret
const generateSecret = totp.generateSecret();

// Verifikasi TOTP
const verifyTOTP = (token, secret) => totp.check(token, secret);

module.exports = { generateTOTP, verifyTOTP, generateSecret };
