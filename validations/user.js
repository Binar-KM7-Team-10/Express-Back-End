const HttpRequestError = require('../utils/error');

module.exports = {
    validateLogin: (data) => {
        const { email, password } = data;

        if (!email) {
            throw new HttpRequestError('Email or Password cannot be empty', 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new HttpRequestError('Invalid email format', 400);
        }

        if (!password) {
            throw new HttpRequestError('Email or Password cannot be empty', 400);
        }
        if (password.length < 8 || password.length > 70) {
            throw new HttpRequestError('Password must be between 8 and 70 characters', 400);
        }
    },

    validateEmail: (data) => {
        const { email } = data;

        if (!email) {
            throw new HttpRequestError('Email or Password cannot be empty', 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new HttpRequestError('Invalid email format', 400);
        }
    },

    validatePasswordReset: (data) => {
        const { token, password } = data;

        if (!token) {
            throw new HttpRequestError('Token must not be empty', 400);
        }


        if (!password) {
            throw new HttpRequestError('Email or Password cannot be empty', 400);
        }
        if (password.length < 8 || password.length > 70) {
            throw new HttpRequestError('Password must be between 8 and 70 characters', 400);
        }
    }
};





// const joi = require('joi');

// module.exports = {
//     validateLogin: (data) => {
//         const schema = joi.object({
//             email: joi.string().email().required().messages({
//                 'string.empty': 'Email tidak boleh kosong',
//                 'string.email': 'Email tidak valid',
//                 'any.required': 'Email wajib diisi',
//             }),
//             password: joi.string().min(8).max(70).required().messages({
//                 'string.empty': 'Password tidak boleh kosong',
//                 'string.min': 'Password minimal 8 karakter',
//                 'string.max': 'Password maksimal 70 karakter',
//                 'any.required': 'Password wajib diisi',
//             }),
//         });
//         return schema.validateAsync(data);
//     },

//     validateEmail: (data) => {
//         const schema = joi.object({
//             email: joi.string().email().required().messages({
//                 'string.empty': 'Email tidak boleh kosong',
//                 'string.email': 'Email tidak valid',
//                 'any.required': 'Email wajib diisi',
//             }),
//         });
//         return schema.validateAsync(data);
//     },

//     validatePasswordReset: (data) => {
//         const schema = joi.object({
//             token: joi.string().required().messages({
//                 'string.empty': 'Token tidak boleh kosong',
//                 'any.required': 'Token wajib diisi',
//             }),
//             password: joi.string().min(8).max(70).required().messages({
//                 'string.empty': 'Password tidak boleh kosong',
//                 'string.min': 'Password minimal 8 karakter',
//                 'string.max': 'Password maksimal 70 karakter',
//                 'any.required': 'Password wajib diisi',
//             }),
//         });
//         return schema.validateAsync(data);
//     },
// };
