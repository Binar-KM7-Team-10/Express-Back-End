const HttpRequestError = require('../utils/error');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


module.exports = {
    create: async (data) => {
        const {fullName, email, phoneNumber, password} = data;

        // VALIDASI INPUT
        if(!fullName || !email || !phoneNumber || !password){
            throw new HttpRequestError('full name, email, password, and phone number are required', 400);
        }

        if (typeof fullName !== 'string' || typeof email !== 'string' || typeof phoneNumber !== 'string' || typeof password !== 'string'){
            throw new HttpRequestError('full name, email, password, and phone number must be string type', 400);
        }

        // VALIDASI EMAIL
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
        // VALIDASI PHONE NUMBER
        if (!phoneNumber.startsWith('62')){
            throw new HttpRequestError("Phone number must start with 62", 400);
        }

        // VALIDASI PASSWORD
        if (password.length <= 8 && password.length >= 16){
            throw new HttpRequestError("Password must be 8 - 16 characters");
        }
    },
    validateId: async (data) => {
        const { id } = data;

        if(!id){
            throw new HttpRequestError("user id is required", 400);
        }else if (isNaN(id)){
            throw new HttpRequestError("user id must be a number", 400);
        }

        const findUserId = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!findUserId){
            throw new HttpRequestError("User does not exist", 404);
        }
    },
    patch: async (data) => {
        const {fullName, email, phoneNumber} = data;

        //VALIDASI INPUT
        if(!fullName || !email || !phoneNumber ){
            throw new HttpRequestError('full name, email, and phone number are required', 400);
        }

        if (typeof fullName !== 'string' || typeof email !== 'string' || typeof phoneNumber !== 'string'){
            throw new HttpRequestError('full name, email, and phone number must be string type', 400);
        }

         // VALIDASI EMAIL
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
        // VALIDASI PHONE NUMBER
        if (!phoneNumber.startsWith('62')){
            throw new HttpRequestError("Phone number must start with 62", 400);
        }
    },
    validateRole: async (data) => {
        const { role } = data;

        if (role == 'Buyer' || role !== 'Admin'){
            throw new HttpRequestError("Access denied, you aren't allowed to access this endpoint.", 403);
        }
    },
} 
