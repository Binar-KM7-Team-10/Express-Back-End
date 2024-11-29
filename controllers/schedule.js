const Schedule = require ('../models/schedule');
const ScheduleValidation = require ('../validations/schedule');

module.exports = {
    create: async (req, res, next) =>{
        try {
            await ScheduleValidation.validateInputData(req.body);
            const scheduleId = await Schedule.create(req.body);

            return res.status(201).json({
                status: 'OK',
                statusCode: 201,
                message: 'Successfully created a new schedule',
                data: {
                    scheduleId
                }
            });
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) =>{
        try {
            await ScheduleValidation.validateId(req.params);
            await Schedule.delete(req.params.id);

            return res.status(200).json({
                status: 'OK',
                statusCode: 200,
                message: 'Successfully deleted schedule'
            });
        } catch (error) {
            next(error);
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
            const outboundSchedules = await Schedule.getManyDTO(req.query);

            if (!outboundSchedules) {
                return res.status(200).json({
                    status: 'OK',
                    statusCode: 200,
                    message: 'Schedule is empty',
                    pageNumber: 1,
                    data: []
                });
            }

            return res.status(200).json({
                status: 'OK',
                statusCode: 200,
                message: 'Successfully retrieved all schedules',
                pageNumber: (req.query.limit && req.query.offset) ? Math.floor(req.query.offset / req.query.limit) + 1 : 1,
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
    },
    editById: async (req, res, next) => {
        try {
            await ScheduleValidation.validateId(req.params);
            ScheduleValidation.validatePatchField(req.body);
            await Schedule.update(req.params.id, req.body);

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Successfully edited schedule'
            });
        } catch (err) {
            next(err);
        }
    },
};