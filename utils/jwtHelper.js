const jwt = require('jsonwebtoken');
const HttpRequestError = require('./error');

const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            throw new HttpRequestError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru', 401);
        }

        return decoded;
    });
};

const signOut = () => {
    return generateToken({}, '1ms');
};

module.exports = {
    generateToken,
    verifyToken,
    signOut,
};
