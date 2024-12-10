const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '7d') => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

const signOut = () => generateToken({}, '1ms');

module.exports = {
    generateToken,
    verifyToken,
    signOut,
};
