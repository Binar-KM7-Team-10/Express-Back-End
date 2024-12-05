const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

const signOut = () => {
    return generateToken({}, '1s');
};

module.exports = {
    generateToken,
    verifyToken,
    signOut,
};
