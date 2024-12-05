const userValidations = require ('../validations/user')
const User = require('../models/user')

module.exports = {
    login: async (req, res, next) => {
        try {
            console.log('Incoming Request:', req.body);
            userValidations.validateLogin(req.body); 
            console.log('Validation Passed');
            const { email, password } = req.body;
            const token = await User.loginUser(email, password);
            console.log('Login Successful, Token:', token);
    
            return res.status(200).json({
                status: 'OK',
                statusCode: 200,
                message: 'Successfully Login',
                token,
            });
        } catch (error) {
            console.error('Error during login:', error);
            next(error);
        }
    },
    

    logout: (req, res) => {
        const token = User.logoutUser();
        return res.status(200).json({
            status: 'OK',
            statusCode: 200,
            message: 'Successfully logged out',
            token,
        });
    },
    createPasswordreset: async (req, res, next) => {
        try {
            await userValidations.validateEmail(req.body)
            const {email} = req.body
            const token = await User.createPasswordToken(email)
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
            await userValidations.validatePasswordReset(req.body)
            const { token, password } = req.body;
            await User.resetPassword(token, password)

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