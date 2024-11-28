const Schedule = require ('../models/schedule');
const ScheduleValidation = require ('../validations/schedule')

module.exports = {
    create: async (req, res, next) =>{
        try {
            await ScheduleValidation.create(req.body);
            await Schedule.create(req.body)

            return res.status(201).json({
                status: 'OK',
                message: 'Schedule created Successfully'
            })
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) =>{
        try {
            await ScheduleValidation.validateId(id)
            await Schedule.deleteById(id)
            res.status(200).json({
                status: 'OK',
                message: 'Schedule deleted Successfully'
            })
        } catch (error) {
            next(error)
        }
    },
    getById: async (req, res, next) =>{
        try {
            await ScheduleValidation.validateId(req.params);
            const data = await Schedule.getDTO(req.params.id);

            return res.status(200).json({
                status: 'OK',
                statusCode: 200,
                message: 'Successfully retrieved schedule details',
                data
            });
        } catch (error) {
            next(error)
        }
    },
    getAll: async (req, res, next) => {
        try {
            const outboundSchedules = await Schedule.getAllDTO();

            if (!outboundSchedules) {
                return res.status(200).json({
                    status: 'OK',
                    statusCode: 200,
                    message: 'Schedule is empty',
                    data: []
                });
            }

            return res.status(200).json({
                status: 'OK',
                statusCode: 200,
                message: 'Schedule retrieved successfully',
                data: {
                    schedule: {
                        outbound: outboundSchedules,
                        inbound: null
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
};