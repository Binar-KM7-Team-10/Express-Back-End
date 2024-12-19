const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Notification {
    static async getAllNotification(query) {
        const { userId } = query;
        const [notifications, count] = await Promise.all([
            prisma.notification.findMany({
                where: {
                    userId: userId ? parseInt(userId) : undefined,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.notification.count({
                where: {
                    userId: userId ? parseInt(userId) : undefined
                }
            })
        ]);

        return {
            pagination: {
                total: count,
            },
            notifications
        }
    }

    static async getNotificationById(params){
        const { id } = params;
        const notification = await prisma.notification.findUnique({
            where: {id: parseInt(id)}
        });

        return notification;
    }

    static async patchReadStatus(params, body){
        const { id } = params;
        const { readStatus } = body;

        await prisma.notification.update({
            where: {id: parseInt(id)},
            data: {
                readStatus
            }
        });
    }

}

module.exports = Notification;