function errorHandler(error, req, res, next) {
    console.error('🚨 Error:', error);

    // Default error
    let status = 500;
    let message = 'Internal server error';
    let details = null;

    // Handle specific error types
    if (error.name === 'ValidationError') {
        status = 400;
        message = 'Validation error';
        details = error.details?.map(detail => detail.message) || [error.message];
    } else if (error.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    } else if (error.code === '23505') { // PostgreSQL unique violation
        status = 409;
        message = 'Resource already exists';
    } else if (error.code === '23503') { // PostgreSQL foreign key violation
        status = 400;
        message = 'Referenced resource not found';
    } else if (error.message.includes('not found')) {
        status = 404;
        message = error.message;
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
        status = 401;
        message = 'Authentication required';
    } else if (error.message.includes('forbidden') || error.message.includes('permission')) {
        status = 403;
        message = 'Insufficient permissions';
    } else if (error.statusCode) {
        status = error.statusCode;
        message = error.message;
    }

    const errorResponse = {
        success: false,
        error: {
            message,
            status,
            timestamp: new Date().toISOString(),
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
    };

    res.status(status).json(errorResponse);
}

module.exports = errorHandler;
