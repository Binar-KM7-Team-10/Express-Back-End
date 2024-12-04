const HttpRequestError = require('../utils/error');
const User = require('../models/user');
const UserValidations = require('../validations/user');

module.exports = {
    create: async (req, res, next) => {
        try {
            // validation create
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
            // validation get
            const userGetAll = await User.getAllUsers(); //tandain

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
            // validation get by id
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
            // validation update
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
            // validation delete
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