const Notification = require('../models/notification');
const notificationValidation = require('../validations/notification');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const { userId, page } = req.query;
            await notificationValidation.validateUserId({userId});
            const get = await Notification.getAllNotification(userId, { page });
    
            if (!get || get.notifications.length === 0) {
                return res.status(200).json({
                    status: "Success",
                    statusCode: 200,
                    message: "Tidak ada notifikasi yang tersedia",
                    data: []
                });
            }

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data notifikasi berhasil diambil",
                data: get
            });
        } catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            await notificationValidation.validateNotificationId(id);
            const getById = await Notification.getNotificationById(id);
    
            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data notifikasi berhasil diambil",
                data: getById,
            });
        } catch (error) {
            next(error);
        }
    },
    patch: async (req, res, next) => {
        try {
            const { id } = req.params
            await notificationValidation.validateNotificationId(id);
            const update = await Notification.patchReadStatus(id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Notifikasi telah berhasil dibaca",
                data: {
                    notification: {
                        readStatus: update.readStatus
                    }
                }
            });
        } catch (error) {
            next(error);
        };
    }
};