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
    }
};