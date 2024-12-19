const HttpRequestError = require("../utils/error");
const Notification = require("../models/notification");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    validateUserId: async (data) => {
        const { userId } = data;
        
        if (userId) {
            if (isNaN(userId)){
                throw new HttpRequestError("Validasi gagal. Pastikan userId yang Anda masukkan dalam format yang benar.", 400);
            }
            
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
    validateNotificationId: async (id) => {
        if (!id) {
            throw new HttpRequestError("Validasi gagal. Pastikan notificationId telah diisi.", 400);
        } else if (isNaN(id)) {
            throw new HttpRequestError("Validasi gagal. Pastikan notificationId yang Anda masukkan dalam format yang benar.", 400);
        }
    
        const findNotificationId = await prisma.notification.findUnique({
            where: {
                id: parseInt(id),
            },
        });
    
        if (!findNotificationId) {
            throw new HttpRequestError("Notifikasi tidak ditemukan.", 404);
        }
    },    
}