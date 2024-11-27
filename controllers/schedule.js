const Schedule = require ('../models/schedule')
const ScheduleValidation = require ('../validations/schedule')

require('dotenv').config();


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
            await ScheduleValidation.validateId(scheduleId)
            await Schedule.delete(scheduleId)
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
            const {scheduleId} = req.params;
            await ScheduleValidation.validateId(scheduleId)
            const Schedule = await Schedule.getById(scheduleId)
            res.status(200).json({
                status: 'OK',
                message: ' Schedule retrieved successfully',
                data: Schedule
            })
        } catch (error) {
            next(error)
        }
    },
    getAll: async (req, res, next)=>{
        try {
            const Schedule = await Schedule.getAll(req.query)
            res.status(200).json({
                status: 'OK',
                message: ' Schedule retrieved successfully',
                data: Schedule
            })
        } catch (error) {
            next(error)
        }
    }
}