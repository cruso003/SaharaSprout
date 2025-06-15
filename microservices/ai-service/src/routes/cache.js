const express = require('express');
const router = express.Router();
const { cache, healthCheck } = require('../config/redis');
const cacheCleanup = require('../utils/cacheCleanup');
const logger = require('../utils/logger');

/**
 * Cache management endpoints for the AI service
 * These endpoints allow monitoring and managing the Redis cache
 */

// Get cache health and statistics
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await healthCheck();
        const stats = await cacheCleanup.getCacheStats();
        
        res.json({
            redis_healthy: isHealthy,
            cache_stats: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Cache health check failed:', error);
        res.status(500).json({
            error: 'Cache health check failed',
            message: error.message
        });
    }
});

// Cleanup invalid cache data
router.post('/cleanup', async (req, res) => {
    try {
        const invalidCount = await cacheCleanup.cleanupInvalidData();
        const expiredCount = await cacheCleanup.cleanupExpiredData();
        
        res.json({
            success: true,
            cleaned_invalid: invalidCount,
            cleaned_expired: expiredCount,
            total_cleaned: invalidCount + expiredCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Cache cleanup failed:', error);
        res.status(500).json({
            error: 'Cache cleanup failed',
            message: error.message
        });
    }
});

// Optimize cache storage
router.post('/optimize', async (req, res) => {
    try {
        const optimizedCount = await cacheCleanup.optimizeCache();
        const stats = await cacheCleanup.getCacheStats();
        
        res.json({
            success: true,
            optimized_entries: optimizedCount,
            current_stats: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Cache optimization failed:', error);
        res.status(500).json({
            error: 'Cache optimization failed',
            message: error.message
        });
    }
});

// Clear specific cache pattern
router.delete('/clear/:pattern', async (req, res) => {
    try {
        const { pattern } = req.params;
        const validPatterns = ['ai', 'market', 'image'];
        
        if (!validPatterns.includes(pattern)) {
            return res.status(400).json({
                error: 'Invalid pattern',
                valid_patterns: validPatterns
            });
        }
        
        const success = await cache.invalidatePattern(`${pattern}:*`);
        
        res.json({
            success,
            pattern_cleared: `${pattern}:*`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Cache clear failed:', error);
        res.status(500).json({
            error: 'Cache clear failed',
            message: error.message
        });
    }
});

// Get cache entry by key
router.get('/entry/:type/:key', async (req, res) => {
    try {
        const { type, key } = req.params;
        let result = null;
        
        switch (type) {
            case 'ai':
                result = await cache.getAIContent(key);
                break;
            case 'market':
                result = await cache.getMarketAnalysis(key);
                break;
            case 'image':
                result = await cache.getImageAnalysis(key);
                break;
            default:
                return res.status(400).json({
                    error: 'Invalid cache type',
                    valid_types: ['ai', 'market', 'image']
                });
        }
        
        if (result) {
            res.json({
                found: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                found: false,
                message: 'Cache entry not found'
            });
        }
    } catch (error) {
        logger.error('Cache retrieval failed:', error);
        res.status(500).json({
            error: 'Cache retrieval failed',
            message: error.message
        });
    }
});

// Cache validation test endpoint
router.post('/validate', async (req, res) => {
    try {
        const { data, type = 'general' } = req.body;
        
        if (!data) {
            return res.status(400).json({
                error: 'Data required for validation'
            });
        }
        
        // Import validation functions if available
        const { isValidCacheData } = require('../config/redis');
        const isValid = isValidCacheData ? isValidCacheData(data, type) : true;
        
        res.json({
            valid: isValid,
            type: type,
            data_provided: !!data,
            validation_available: !!isValidCacheData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Cache validation failed:', error);
        res.status(500).json({
            error: 'Cache validation failed',
            message: error.message
        });
    }
});

module.exports = router;
