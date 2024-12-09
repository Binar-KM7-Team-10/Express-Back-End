const HttpRequestError = require('../utils/error');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


module.exports = {
    create: async (data) => {
        const {fullName, email, phoneNumber, password, role, googleId } = data;

        // VALIDASI INPUT
        if(!fullName || !email || !phoneNumber || !password || !role){
            throw new HttpRequestError('Validasi gagal. Pastikan fullName, email, phoneNumber, password, dan role telah diisi.', 400);
        }

        if (typeof fullName !== 'string' ||
            typeof email !== 'string' ||
            typeof phoneNumber !== 'string' ||
            typeof password !== 'string' ||
            typeof role !== 'string' ||
            googleId && typeof googleId !== 'string'
        ){
            throw new HttpRequestError('Validasi gagal. email, phoneNumber, fullName, password, googleId, dan role harus berupa string.', 400);
        }

        // VALIDASI EMAIL
        const findEmail = await prisma.user.findUnique({
            where: {email: email}
        })

        if (findEmail){
            throw new HttpRequestError("Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.", 409);
        }

        if (!email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
            throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
        }
        // VALIDASI PHONE NUMBER
        if (!phoneNumber.startsWith("628") || phoneNumber.length < 11 || phoneNumber.length > 15){
            throw new HttpRequestError("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.", 400);
        }

        const isPhoneNumber = await prisma.user.findUnique({
            where: {
                phoneNumber
            }
        });

        if (isPhoneNumber) {
            throw new HttpRequestError("Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.", 409);
        }

        // VALIDASI PASSWORD
        if (password.length < 8 || password.length > 70){
            throw new HttpRequestError("Validasi gagal. password harus memiliki 8 hingga 70 digit.", 400);
        }

        if (role !== 'Buyer' || role !== 'Admin') {
            throw new HttpRequestError("Validasi gagal. Pastikan role memiliki nilai \'Buyer\' atau \'Admin\'.", 400);
        }
    },
    validateId: async (data) => {
        const { id } = data;

        if(!id){
            throw new HttpRequestError("Validasi gagal. Pastikan userId telah diisi.", 400);
        }else if (isNaN(id)){
            throw new HttpRequestError("userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar.", 400);
        }

        const findUserId = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!findUserId){
            throw new HttpRequestError("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.", 404);
        }
    },
    patch: async (data) => {
        const { fullName, email, phoneNumber, password } = data;

        //VALIDASI INPUT
        if(!fullName && !email && !phoneNumber && !password){
            throw new HttpRequestError('Validasi gagal. Pastikan terdapat paling tidak satu field untuk diubah.', 400);
        }

        if (fullName && typeof fullName !== 'string' ||
            email && typeof email !== 'string' ||
            phoneNumber && typeof phoneNumber !== 'string' ||
            password && typeof password !== 'string'
        ){
            throw new HttpRequestError('Validasi gagal. email, phoneNumber, fullName, dan password harus berupa string.', 400);
        }

         // VALIDASI EMAIL
        if (email) {
            const findEmail = await prisma.user.findUnique({
                where: {email: email}
            })

            if (findEmail){
                throw new HttpRequestError("Email sudah terdaftar. Silakan gunakan email lain.", 409);
            }
    
            if (!email.match(
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )) {
                throw new HttpRequestError('Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.', 400);
            }
        }

        // VALIDASI PHONE NUMBER
        if (phoneNumber) {
            if (!phoneNumber.startsWith("628") || phoneNumber.length < 11 || phoneNumber.length > 15){
                throw new HttpRequestError("Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.", 400);
            }
    
            const isPhoneNumber = await prisma.user.findUnique({
                where: {
                    phoneNumber
                }
            });
    
            if (isPhoneNumber) {
                throw new HttpRequestError("Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.", 409);
            }
        }

        if (password && (password.length < 8 || password.length > 70)){
            throw new HttpRequestError("Validasi gagal. password harus memiliki 8 hingga 70 digit.", 400);
        }
    },
    validateRole: async (data) => {
        const { role } = data;

        if (role == 'Buyer' || role !== 'Admin'){
            throw new HttpRequestError("Access denied, you aren't allowed to access this endpoint.", 403);
        }
    },
} 
