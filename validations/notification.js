const HttpRequestError = require("../utils/error");
const Notification = require("../models/notification");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
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
    validatePostData: async (data) => {
        const { userId, bookingId, scheduleId, paymentId, title, message, createdAt, readStatus} = data;

        if(!userId || !title || !message){
            throw new HttpRequestError("Validasi gagal. Pastikan terdapat userId, title, message", 400);
        }

        if (typeof userId !== 'number'){
            throw new HttpRequestError("Validasi gagal. Pastikan userId berupa number", 400);
        }

        if (typeof title !== 'string' || typeof message !== 'string'){
            throw new HttpRequestError("Validasi gagal. Pastikan title dan message berupa string", 400);
        }

        if (bookingId !== undefined && typeof bookingId !== 'number') {
            throw new HttpRequestError("Validasi gagal. Pastikan bookingId berupa number", 400);
        }

        if (scheduleId !== undefined && typeof scheduleId !== 'number') {
            throw new HttpRequestError("Validasi gagal. Pastikan scheduleId berupa number", 400);
        }

        if (paymentId !== undefined && typeof paymentId !== 'number') {
            throw new HttpRequestError("Validasi gagal. Pastikan paymentId berupa number", 400);
        }

        if (createdAt && !(createdAt instanceof Date) && isNaN(Date.parse(createdAt))) {
            throw new HttpRequestError("Validasi gagal. Pastikan createdAt berupa tanggal yang valid", 400);
        }

        if (typeof readStatus !== 'boolean'){
            throw new HttpRequestError("Validasi gagal. Pastikan readStatus berupa boolean", 400);
        }
    },
    validateUpdateStatus: async (data) => {
        const {readStatus} = data;

        if(!readStatus){
            throw new HttpRequestError("Validasi gagal. Pastikan terdapat readStatus");
        }

        if (typeof readStatus !== 'boolean'){
            throw new HttpRequestError("Validasi gagal. Pastikan readStatus berupa boolean", 400);
        }
    }

}