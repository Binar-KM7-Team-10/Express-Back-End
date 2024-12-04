const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const HttpRequestError = require('../utils/error');
const bcrypt = require('bcrypt');

class User {
    static async getAllUsers(){
        const findUsers = await prisma.user.findMany({
            orderBy: {id: "asc"},
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true
            }
        });
        return findUsers;
    }

    static async getUserById(id){
        //const { id } = req.params;
        const findUser = await prisma.user.findUnique({
            where: {id: Number(id)},
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true
            }
        });
        return findUser;
    }

    static async create({ email, phoneNumber, fullName, password, role }){
        const hashedPassword = await bcrypt.hash(password, 10);

        const createUser = await prisma.user.create({
            data: {
                email,
                phoneNumber,
                password: hashedPassword,
                fullName,
                role,
                isVerified: true
            }
        });

        return createUser;
    }

    static async patchUser(id, data){
        const { fullName, phoneNumber, email } = data;

        const findUser = await prisma.user.findUnique({
            where: {id: Number(id)}
        });

        if (!findUser) {
            throw new HttpRequestError(404, "Pengguna tidak ditemukan");
        }

        await prisma.user.update({
            where: {id: Number(id)},
            data: {
                fullName: fullName,
                email: email,
                phoneNumber: phoneNumber,
            }
        })
    }

    static async deleteUser(id){
        await prisma.user.delete({
            where: {id: Number(id)}
        })
    }
}

module.exports = User; 
