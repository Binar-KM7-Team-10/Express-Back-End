const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const HttpRequestError = require('../utils/error');
const bcrypt = require('bcrypt');

class User {
    static async getAllUsers(){
        const findUsers = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true
            }
        });

        return findUsers;
    }

    static async getUserById(id){
        // const { id } = req.params.id;
        const findUser = await prisma.user.findUnique({
            where: {id: parseInt(id)},
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true
            }
        });

        return findUser;
    }

    static async create({ email, phoneNumber, fullName, password, googleId = null, role }){
        const hashedPassword = await bcrypt.hash(password, 10);

        const createUser = await prisma.user.create({
            data: {
                email,
                phoneNumber,
                password: hashedPassword,
                fullName,
                googleId,
                role,
                isVerified: true
            }
        });

        return createUser;
    }

    static async patchUser(id, data){
        const { fullName = undefined, phoneNumber = undefined, email = undefined, password = undefined } = data;

        const user = await prisma.user.update({
            where: {id: parseInt(id)},
            data: {
                fullName: fullName,
                email: email,
                password: password,
                phoneNumber: phoneNumber,
            }
        });

        return user;
    }

    static async deleteUser(id){
        await prisma.user.delete({
            where: {id: parseInt(id)}
        })
    }
}

module.exports = User; 
