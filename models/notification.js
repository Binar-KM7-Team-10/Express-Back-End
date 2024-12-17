const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Notification {
    static async getAllNotification(userId, query) {
        const {page = 1} = query;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [notifications, count] = await Promise.all([
            prisma.notification.findMany({
                where: {
                    userId: parseInt(userId),
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.notification.count({
                where: {
                    userId: parseInt(userId)
                }
            })
        ]);

        const totalPages = Math.ceil(count / limit);

        return {
            pagination: {
                total: count,
            },
            notifications
        }
    }

    static async getNotificationById(id){
        const notification = await prisma.notification.findUnique({
            where: {id: parseInt(id)}
        });

        return notification;
    }

    static async patchReadStatus(id){
        const updateStatus = await prisma.notification.update({
            where: {id: parseInt(id)},
            data: {
                readStatus: true
            }
        });

        return updateStatus;
    }

}

module.exports = Notification;