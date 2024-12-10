const User = require('../models/user');
const UserValidations = require('../validations/user');

module.exports = {
    create: async (req, res, next) => {
        try {
            await UserValidations.create(req.body);
            const userCreate = await User.create(req.body);

            return res.status(201).json({
                status: "Success",
                statusCode: 201,
                message: "Pengguna berhasil ditambahkan.",
                data: {
                    user: {
                        id: userCreate.id,
                        fullname: userCreate.fullName,
                        email: userCreate.email,
                        phoneNumber: userCreate.phoneNumber,
                        role: userCreate.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const userGetAll = await User.getAllUsers(); 

            if (userGetAll.length === 0){
                return res.status(200).json({
                    status: "Success",
                    statusCode: 200,
                    message: "Tidak ada data pengguna yang ditemukan.",
                    data: []
                });
            }

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data pengguna berhasil diambil.",
                data: userGetAll
            })
        } catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            await UserValidations.validateId(req.params);
            const userGetById = await User.getUserById(req.params.id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data pengguna berhasil diambil.",
                data: userGetById
            });
        } catch (err) {
            next(err);
        }
    },
    update: async (req, res, next) => {
        try {
            await UserValidations.validateId(req.params);
            await UserValidations.patch(req.body);
            const editUser = await User.patchUser(req.params.id, req.body);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Data pengguna berhasil diperbarui.",
                data: {
                    user: {
                        id: editUser.id,
                        fullName: editUser.fullName,
                        email: editUser.email,
                        phoneNumber: editUser.phoneNumber,
                        role: editUser.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await UserValidations.validateId(req.params);
            await User.deleteUser(req.params.id);

            return res.status(200).json({
                status: "Success",
                statusCode: 200,
                message: "Pengguna berhasil dihapus."
            })
        } catch (error) {
            next(error);
        }
    }
    

}