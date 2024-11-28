const HttpRequestError = require('./error');

module.exports = (err, req, res, next) => {
    // console.log(err.message);
    if (err instanceof HttpRequestError) {
        return res.status(err.statusCode).json({
            status: 'Fail',
            statusCode: err.statusCode,
            message: err.message
        });
    }

    return res.status(500).json({
        status: 'Error',
        statusCode: 500,
        message: 'Internal Server Error'
    });
};