const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('Error Handler:', {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                error = {
                    message: 'Duplicate value entered',
                    statusCode: 409
                };
                break;
            case '23503': // Foreign key violation
                error = {
                    message: 'Referenced record not found',
                    statusCode: 400
                };
                break;
            case '23502': // Not null violation
                error = {
                    message: 'Required field is missing',
                    statusCode: 400
                };
                break;
            case '23514': // Check violation
                error = {
                    message: 'Invalid data format',
                    statusCode: 400
                };
                break;
            case '08003': // Connection does not exist
            case '08006': // Connection failure
                error = {
                    message: 'Database connection error',
                    statusCode: 503
                };
                break;
            default:
                error = {
                    message: 'Database error',
                    statusCode: 500
                };
        }
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = {
            message: 'Invalid token',
            statusCode: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        error = {
            message: 'Token expired',
            statusCode: 401
        };
    }

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = {
            message: 'File too large',
            statusCode: 400
        };
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        error = {
            message: 'Too many files',
            statusCode: 400
        };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = {
            message: 'Unexpected file field',
            statusCode: 400
        };
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Don't leak error details in production
    const response = {
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
