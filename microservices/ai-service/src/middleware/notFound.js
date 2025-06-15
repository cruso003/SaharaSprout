const logger = require('../utils/logger');

const notFound = (req, res, next) => {
    const error = {
        success: false,
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
        code: 'ENDPOINT_NOT_FOUND',
        timestamp: new Date().toISOString(),
        available_endpoints: {
            health: '/health',
            ai_generation: '/api/ai',
            market_intelligence: '/api/market',
            image_services: '/api/images',
            analytics: '/api/analytics'
        }
    };

    logger.warn('404 - Endpoint not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    res.status(404).json(error);
};

module.exports = notFound;
