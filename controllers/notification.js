const Notification = require('../models/notification');
const notificationValidation = require('../validations/notification');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            await notificationValidation.validateUserId(req.query);
            const { pagination, notifications } = await Notification.getAllNotification(req.query);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: notifications.length === 0 ? "Tidak ada notifikasi yang tersedia." : "Data notifikasi berhasil diambil.",
                pagination,
                data: notifications
            });
        } catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            await notificationValidation.validateNotificationId(req.params);
            const getById = await Notification.getNotificationById(req.params);
    
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