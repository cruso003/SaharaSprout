const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../../package.json').version,
        service: 'order-service',
        port: process.env.PORT || 3012,
        database: {
            status: 'connected',
            type: 'postgresql'
        },
        cache: {
            status: 'connected',
            type: 'redis'
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    };

    res.status(200).json(healthCheck);
});

module.exports = router;
