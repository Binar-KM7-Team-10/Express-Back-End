const Homepage = require("../models/homepage");
const HomepageValidation = require('../validations/homepage');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            HomepageValidation.queryParams(req.query);
            const homepageData = await Homepage.findMany(req.query);

            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: 'Data homepage berhasil diambil.',
                pagination: homepageData.pagination,
                data: homepageData.data
            });
        } catch (err) {
            next(err);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const cities = await Homepage.getAllCities();
            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: cities.length > 0 ? 'Data kota berhasil diambil.' : "Tidak ada kota yang tersedia",
                pagination : {
                    total: cities.length
                },
                data: {
                    cities
                }
            });
        } catch (err) {
            next(err);
        }
    }
};