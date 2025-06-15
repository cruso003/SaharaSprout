const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error for monitoring
    logger.error('AI Service Error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    });

    // Handle different types of errors
    let statusCode = 500;
    let errorResponse = {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    };

    // AI Service specific errors
    if (err.name === 'OpenAIError') {
        statusCode = 502;
        errorResponse = {
            success: false,
            message: 'AI service temporarily unavailable',
            code: 'AI_SERVICE_ERROR',
            timestamp: new Date().toISOString()
        };
    }

    // Rate limiting errors
    if (err.name === 'RateLimitError' || err.code === 'RATE_LIMIT_EXCEEDED') {
        statusCode = 429;
        errorResponse = {
            success: false,
            message: 'Rate limit exceeded. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
            retry_after: err.retryAfter || '15 minutes'
        };
    }

    // Cost limit errors
    if (err.code === 'COST_LIMIT_EXCEEDED') {
        statusCode = 402;
        errorResponse = {
            success: false,
            message: 'Daily cost limit exceeded. Please upgrade your plan or try again tomorrow.',
            code: 'COST_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
            current_cost: err.currentCost,
            daily_limit: err.dailyLimit
        };
    }

    // Authentication errors
    if (err.name === 'UnauthorizedError' || err.code === 'INVALID_TOKEN') {
        statusCode = 401;
        errorResponse = {
            success: false,
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
        };
    }

    // Validation errors
    if (err.name === 'ValidationError' || err.type === 'validation') {
        statusCode = 400;
        errorResponse = {
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
            errors: err.errors || [err.message]
        };
    }

    // Database errors
    if (err.code && err.code.startsWith('23')) { // PostgreSQL constraint errors
        statusCode = 400;
        errorResponse = {
            success: false,
            message: 'Database constraint violation',
            code: 'DATABASE_ERROR',
            timestamp: new Date().toISOString()
        };
    }

    // Network/timeout errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        statusCode = 503;
        errorResponse = {
            success: false,
            message: 'Service temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE',
            timestamp: new Date().toISOString()
        };
    }

    // File size errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        errorResponse = {
            success: false,
            message: 'File too large. Maximum size is 10MB.',
            code: 'FILE_TOO_LARGE',
            timestamp: new Date().toISOString()
        };
    }

    // Image processing errors
    if (err.name === 'ImageProcessingError') {
        statusCode = 422;
        errorResponse = {
            success: false,
            message: 'Unable to process image. Please ensure it\'s a valid image format.',
            code: 'IMAGE_PROCESSING_ERROR',
            timestamp: new Date().toISOString()
        };
    }

    // AI generation specific errors
    if (err.name === 'AIGenerationError') {
        statusCode = 422;
        errorResponse = {
            success: false,
            message: 'Failed to generate AI content. Please try with different input.',
            code: 'AI_GENERATION_ERROR',
            timestamp: new Date().toISOString()
        };
    }

    // Market data errors
    if (err.name === 'MarketDataError') {
        statusCode = 503;
        errorResponse = {
            success: false,
            message: 'Market data temporarily unavailable',
            code: 'MARKET_DATA_ERROR',
            timestamp: new Date().toISOString()
        };
    }

    // In development, include stack trace
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.original_error = err.message;
    }

    // Track error metrics (optional - could be sent to monitoring service)
    try {
        // This could be expanded to send to monitoring services like Sentry
        logger.info('Error metrics', {
            error_code: errorResponse.code,
            status_code: statusCode,
            user_id: req.user?.id,
            endpoint: req.originalUrl
        });
    } catch (metricsError) {
        logger.error('Failed to track error metrics:', metricsError);
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
