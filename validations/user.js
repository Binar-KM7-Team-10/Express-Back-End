const HttpRequestError = require('../utils/error');
const User = require('../models/user');

module.exports = {
    create: async (data) => {
        const {fullName, email, phoneNumber, password} = data;

        // NTAR DULU KALO INI AWKOAKWOAWK
    },
    validateRole: async (data) => {
        const { role,  } = data;

        if (role == 'buyer' || role !== 'admin'){
            throw new HttpRequestError("Access denied, you aren't allowed to access this endpoint.", 403);
        }
    },
    validateEmail: async (data) => {
        const {email} = data;
        const findEmail = await prisma.user.findUnique({
            where: {email: email}
        })

        if (email == findEmail){
            throw new HttpRequestError("Email has been registered, please use another email or login with that email", 409);
        }

        if (!email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
            throw new HttpRequestError('Email must be in valid format', 400);
        }
    },

} 
