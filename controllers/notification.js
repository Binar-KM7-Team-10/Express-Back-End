const Notification = require('../models/notification');
const notificationValidation = require('../validations/notification');

module.exports = {
    create: async (req, res, next) => {
        try {
            await notificationValidation.validatePostData(req.body);
            const create = await Notification.createNotification(req.body);

            return res.status(201).json({
                status: "Success",
                statusCode: 201,
                message: " ",
                data: {
                    notification: {
                        userId: create.userId,                 
                        bookingId: create.bookingId,   
                        scheduleId: create.scheduleId, 
                        paymentId: create.paymentId,   
                        title: create.title,                   
                        message: create.message,
                    }
                }
            })
        } catch (error) {
            next(error);
        };
    },
    get: async (req, res, next) => {
        try {
            await notificationValidation.validateId(req.params.id);
            const get = await Notification.getNotification(req.params.id);

            if (!get){
                return res.status(200).json({
                    status: "Success",
                    statusCode: 200,
                    message: " Tidak ada data ",
                    data: []
                });
            }

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: " ",
                data: get
            });
        } catch (error) {
            next(error);
        };
    },
    update: async (req, res, next) => {
        try {
            await notificationValidation.validateId(req.params.id);
            await notificationValidation.validateUpdateStatus(req.body);
            const update = await Notification.updateReadStatus(req.params.id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data notifikasi berhasil diperbarui.",
                data: {
                    notification: {
                        readStatus: update.readStatus
                    }
                }
            });
        } catch (error) {
            next(error);
        };
    },
    delete: async (req, res, next) => {
        try {
            await notificationValidation.validateId(req.params.id);
            await Notification.deleteNotification(req.params.id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Notifikasi berhasil dihapus",
            })
        } catch (error) {
            next(error);
        };
    }
};