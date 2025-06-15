const express = require('express');
const router = express.Router();
const { healthCheck: dbHealthCheck } = require('../config/database');
const { healthCheck: redisHealthCheck } = require('../config/redis');
const logger = require('../utils/logger');

// Basic health check
router.get('/', async (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Product Service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
    const health = {
        status: 'OK',
        service: 'Product Service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0',
        checks: {
            database: 'OK',
            redis: 'OK'
        }
    };

    try {
        // Check database
        const dbStatus = await dbHealthCheck();
        health.checks.database = dbStatus ? 'OK' : 'FAIL';

        // Check Redis
        const redisStatus = await redisHealthCheck();
        health.checks.redis = redisStatus ? 'OK' : 'FAIL';

        // Overall status
        const allChecksPass = Object.values(health.checks).every(status => status === 'OK');
        health.status = allChecksPass ? 'OK' : 'DEGRADED';

        const statusCode = allChecksPass ? 200 : 503;
        res.status(statusCode).json(health);

    } catch (error) {
        logger.error('Health check error:', error);
        
        health.status = 'ERROR';
        health.error = error.message;
        
        res.status(503).json(health);
    }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
    try {
        // Check if service is ready to handle requests
        const dbStatus = await dbHealthCheck();
        const redisStatus = await redisHealthCheck();

        if (dbStatus && redisStatus) {
            res.status(200).json({
                status: 'Ready',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'Not Ready',
                timestamp: new Date().toISOString(),
                checks: {
                    database: dbStatus ? 'OK' : 'FAIL',
                    redis: redisStatus ? 'OK' : 'FAIL'
                }
            });
        }
    } catch (error) {
        logger.error('Readiness check error:', error);
        res.status(503).json({
            status: 'Not Ready',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
    // Simple liveness check - if the process is running, it's alive
    res.status(200).json({
        status: 'Alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Metrics endpoint (basic)
router.get('/metrics', async (req, res) => {
    try {
        const metrics = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            environment: process.env.NODE_ENV,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };

        res.json(metrics);
    } catch (error) {
        logger.error('Metrics error:', error);
        res.status(500).json({
            error: 'Failed to retrieve metrics',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
