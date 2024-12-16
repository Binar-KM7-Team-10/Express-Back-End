const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Notification {
    static async getNotification(userId){
        const notification = await prisma.notification.findMany({
            where: {
                userId: parseInt(userId),
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return notification;
    }

    static async createNotification({userId, bookingId, scheduleId, paymentId, title, message}){
        const createNotification = await prisma.notification.create({
            data: {
                userId,                 
                bookingId: bookingId || null,   
                scheduleId: scheduleId || null, 
                paymentId: paymentId || null,   
                title,                   
                message,               
            }
        });

        return createNotification;
    }

    static async updateReadStatus(id){
        const updateStatus = await prisma.notification.update({
            where: {id: parseInt(id)},
            data: {
                readStatus: true
            }
        });

        return updateStatus;
    }

    static async deleteNotification(id){
        await prisma.notification.delete({
            where: {id: parseInt(id)}
        });
    }

}

module.exports = Notification;