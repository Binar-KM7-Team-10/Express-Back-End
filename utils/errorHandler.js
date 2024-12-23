const HttpRequestError = require('./error');

module.exports = (err, req, res, next) => {
    // console.log(err);
    if (err instanceof HttpRequestError) {
        return res.status(err.statusCode).json({
            status: 'Failed',
            statusCode: err.statusCode,
            message: err.message
        });
    }
    
    return res.status(500).json({
        status: 'Failed',
        statusCode: 500,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
    });
};