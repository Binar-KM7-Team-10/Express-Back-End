const Schedule = require ('../models/schedule');
const ScheduleValidation = require ('../validations/schedule');

module.exports = {
    create: async (req, res, next) =>{
        try {
            await ScheduleValidation.validateInputData(req.body);
            const scheduleId = await Schedule.create(req.body);

            return res.status(201).json({
                status: 'Success',
                statusCode: 201,
                message: 'Berhasil membuat jadwal penerbangan.',
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
                status: 'Success',
                statusCode: 200,
                message: 'Berhasil menghapus jadwal penerbangan.'
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
                status: 'Success',
                statusCode: 200,
                message: 'Berhasil mendapatkan data jadwal penerbangan.',
                data
            });
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            ScheduleValidation.validateQueryParams(req.query);
            const result = await Schedule.getManyDTO(req.query);

            if (result.data.length === 0) {
                return res.status(200).json({
                    status: 'Success',
                    statusCode: 200,
                    message: 'Tidak ada data jadwal penerbangan yang tersedia',
                    pagination: {
                        currentPage: 1,
                        totalPage: 1,
                        count: 0,
                        total: 0,
                        hasNextPage: false,
                        hasPreviousPage: false
                    },
                    data: []
                });
            }

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Data jadwal penerbangan berhasil diambil.',
                pagination: {
                    ...result.pagination
                },
                data: {
                    schedule: {
                        outbound: result.data,
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
            await ScheduleValidation.validatePatchField(req.body, req.params);
            await Schedule.update(req.params.id, req.body);

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Berhasil memperbarui jadwal penerbangan.'
            });
        } catch (err) {
            next(err);
        }
    },
};