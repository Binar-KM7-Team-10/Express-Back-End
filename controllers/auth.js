const UserValidations = require ('../validations/user')
const Auth = require('../models/auth')
const JwtHelper = require('../utils/jwtHelper');

module.exports = {
    login: async (req, res, next) => {
        try {
            UserValidations.validateLogin(req.body); 
            const { email, password } = req.body;
            const user = await Auth.login(email, password);
            const accessToken = JwtHelper.generateToken(user);
    
            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Login berhasil.',
                data: {
                    user,
                    accessToken
                }
            });
        } catch (err) {
            next(err);
        }
    },
    logout: (req, res) => {
        const accessToken = Auth.logout();
        
        return res.status(200).json({
            status: 'Success',
            statusCode: 200,
            message: 'Logout berhasil. Anda telah keluar dari akun Anda.',
            data: {
                accessToken
            }
        });
    },
    createPasswordreset: async (req, res, next) => {
        try {
            await UserValidations.validateEmail(req.body)
            const {email} = req.body
            const token = await Auth.createPasswordToken(email)
            return res.status (200).json({
                status: 'OK',
                statusCode: 200,
                message: 'password reset token already sent to email',
                token,
            })
        } catch (error) {
            next(error)
        }
    },
    resetPassword: async (req, res, next) =>{
        try {
            await UserValidations.validatePasswordReset(req.body)
            const { token, password } = req.body;
            await Auth.resetPassword(token, password)

            return res.status (200).json({
                status: 'OK',
                statusCode: 200,
             message: 'Password updated successfully',
            })
        } catch (error) {
            next(error)
        }
    }
}