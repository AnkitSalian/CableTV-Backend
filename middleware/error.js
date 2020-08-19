const ErrorResponse = require('../utils/errorResponse');
//ToDo: To be customized according to the schema
const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    //Log to console
    console.log(err);

    //Mongoose bad ObjectIds
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    //Mongoose duplicate keys
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }

    //Mongoose validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statuscode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler;