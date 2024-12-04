const User = require('../models/user');
const UserValidations = require('../validations/user');

module.exports = {
    create: async (req, res, next) => {
        try {
            await UserValidations.validateRole(req.body);
            await UserValidations.create(req.body);
            const userCreate = await User.create(req.body);

            return res.status(201).json({
                status: "Success",
                statusCode: 201,
                message: "Pengguna berhasil ditambahkan.",
                data: userCreate
            });
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            await UserValidations.validateRole(req.body);
            const userGetAll = await User.getAllUsers(); 

            if (userGetAll.length === 0){
                return res.status(200).json({
                    status: "Success",
                    statusCode: 200,
                    message: "Tidak ada data pengguna yang ditemukan",
                    data: []
                });
            }

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data pengguna berhasil diambil.",
                data: userGetAll
            })
        } catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            await UserValidations.validateId(req.params.id);
            const userGetById = await User.getUserById(req.params.id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data pengguna berhasil diambil",
                data: userGetById
            })
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            await UserValidations.validateId(req.params.id);
            await UserValidations.patch(req.body);
            const editUser = await User.patchUser(req.params.id, req.body);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data pengguna berhasil diperbarui.",
                data: editUser
            })
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await UserValidations.validateId(req.params.id);
            await User.deleteUser(req.params.id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Pengguna berhasil dihapus"
            })
        } catch (error) {
            next(error);
        }
    }
    

}