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
                message: homepageData.data.length !== 0 ? 'Data homepage berhasil diambil.' : 'Tidak ada data homepage yang tersedia.',
                pagination: homepageData.data.length !== 0 ? homepageData.pagination : {
                    currentPage: 0,
                    totalPage: 0,
                    count: 0,
                    total: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                },
                data: homepageData.data
            });
        } catch (err) {
            next(err);
        }
    },
    getCity: async (req, res, next) => {
        try {
            const cities = await Homepage.getCities();
            return res.status(200).json({
                status: 'Success',
                statusCode: 200,
                message: cities.length > 0 ? 'Data kota berhasil diambil.' : "Tidak ada kota yang tersedia.",
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