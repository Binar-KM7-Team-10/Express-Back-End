const UserValidation = require('../validations/user');
const User = require('../models/user');
const {sendEmail} = require('../utils/mailerSmtp');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
    register: async (req, res, next) => {
        try {
            await UserValidation.register(req.body);
            const data = await User.create(req.body);

            await sendEmail(data.email, 'Welcome to our platform', 'Thank you for registering');

            return res.status(201).json({
                status: 'OK',
                message: 'Successfully registered',
                data
            });
        } catch (err) {
            next(err);
        }
    }
}