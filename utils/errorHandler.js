const HttpRequestError = require('./error');

module.exports = (err, req, res, next) => {
    if (err instanceof HttpRequestError) {
        return res.status(err.statusCode).json({
            status: 'Fail',
            message: err.message
        });
    }

    return res.status(500).json({
        status: 'Fail',
        message: 'Internal server error'
    });
};