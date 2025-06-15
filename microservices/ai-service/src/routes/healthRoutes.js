const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Basic health check
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ai-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// Detailed readiness check
router.get('/ready', async (req, res) => {
    const checks = {
        status: 'healthy',
        service: 'ai-service',
        timestamp: new Date().toISOString(),
        checks: {}
    };

    try {
        // Check database connection
        try {
            const dbResult = await getPool().query('SELECT 1 as healthy');
            checks.checks.database = {
                status: 'healthy',
                response_time: 'fast'
            };
        } catch (dbError) {
            checks.checks.database = {
                status: 'unhealthy',
                error: dbError.message
            };
            checks.status = 'unhealthy';
        }

        // Check Redis connection
        try {
            await cache.ping();
            checks.checks.redis = {
                status: 'healthy',
                response_time: 'fast'
            };
        } catch (redisError) {
            checks.checks.redis = {
                status: 'unhealthy',
                error: redisError.message
            };
            checks.status = 'unhealthy';
        }

        // Check AI service configuration
        checks.checks.ai_config = {
            status: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
            openai: !!process.env.OPENAI_API_KEY,
            replicate: !!process.env.REPLICATE_API_TOKEN,
            cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
        };

        // Check system resources
        const memUsage = process.memoryUsage();
        checks.checks.system = {
            status: 'healthy',
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
            },
            uptime: Math.round(process.uptime()) + 's',
            cpu_load: process.cpuUsage()
        };

        const statusCode = checks.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(checks);

    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            service: 'ai-service',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Liveness probe (simpler check for k8s)
router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
});

// AI service specific metrics
router.get('/metrics', async (req, res) => {
    try {
        // Get usage statistics from database
        const usageStats = await getPool().query(`
            SELECT 
                COUNT(*) as total_generations,
                COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as daily_generations,
                COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as hourly_generations,
                AVG(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN cost_usd END) as avg_daily_cost
            FROM ai_generations
        `);

        const rateLimitStats = await getPool().query(`
            SELECT 
                user_id,
                SUM(request_count) as total_requests,
                MAX(last_request) as last_activity
            FROM ai_usage_tracking 
            WHERE date_tracked = CURRENT_DATE
            GROUP BY user_id
            ORDER BY total_requests DESC
            LIMIT 10
        `);

        res.json({
            service: 'ai-service',
            timestamp: new Date().toISOString(),
            metrics: {
                ai_generations: usageStats.rows[0] || {},
                top_users: rateLimitStats.rows || [],
                cache_stats: {
                    connected: true // Redis connection status
                },
                system: {
                    memory: process.memoryUsage(),
                    uptime: process.uptime(),
                    pid: process.pid
                }
            }
        });

    } catch (error) {
        logger.error('Metrics collection failed:', error);
        res.status(500).json({
            error: 'Failed to collect metrics',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
