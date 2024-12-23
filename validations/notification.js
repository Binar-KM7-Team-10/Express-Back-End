const HttpRequestError = require("../utils/error");
const Notification = require("../models/notification");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    validateUserId: async (data) => {
        const { userId } = data;
        
        if (userId) {            
            const findUserId = await prisma.user.findUnique({
                where: {
                    id: parseInt(userId)
                }
            });
        
            if (!findUserId){
                throw new HttpRequestError("Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar.", 404);
            }
        }
    
    },
    validateBody: (body) => {
        const { readStatus } = body;

        if (!readStatus) {
            throw new HttpRequestError('Validasi gagal. Pastikan readStatus telah diisi.', 400);
        } else if (typeof readStatus !== 'boolean') {
            throw new HttpRequestError('Validasi gagal. Pastikan readStatus bertipe boolean.', 400);
        }
    }
}