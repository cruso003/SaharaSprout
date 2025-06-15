const { cache } = require('../config/redis');
const logger = require('./logger');

/**
 * Cache cleanup utility for the AI service
 * Provides functions to clean invalid cache data and optimize storage
 */

// Clean up invalid cache entries
const cleanupInvalidData = async () => {
    try {
        logger.info('Starting cache cleanup process...');
        const cleanedCount = await cache.cleanupInvalidData();
        logger.info(`Cache cleanup completed. Cleaned ${cleanedCount} invalid entries.`);
        return cleanedCount;
    } catch (error) {
        logger.error('Error during cache cleanup:', error);
        return 0;
    }
};

// Clean up expired cache entries (for manual cleanup)
const cleanupExpiredData = async () => {
    try {
        const client = cache.getRedisClient();
        const patterns = ['ai:*', 'market:*', 'image:*'];
        let expiredCount = 0;
        
        for (const pattern of patterns) {
            const keys = await client.keys(pattern);
            for (const key of keys) {
                const ttl = await client.ttl(key);
                if (ttl === -1) {
                    // Key exists but has no expiration, check if it's old data
                    const value = await client.get(key);
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            const createdAt = new Date(parsed.generated_at || parsed.retrieved_at || parsed.analyzed_at);
                            const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
                            
                            // Remove data older than 7 days without TTL
                            if (hoursOld > 168) {
                                await client.del(key);
                                expiredCount++;
                            }
                        } catch (parseError) {
                            // Invalid JSON, delete it
                            await client.del(key);
                            expiredCount++;
                        }
                    }
                }
            }
        }
        
        logger.info(`Cleaned ${expiredCount} expired cache entries`);
        return expiredCount;
    } catch (error) {
        logger.error('Error cleaning expired data:', error);
        return 0;
    }
};

// Get cache statistics
const getCacheStats = async () => {
    try {
        const client = cache.getRedisClient();
        const patterns = ['ai:*', 'market:*', 'image:*'];
        const stats = {
            total_keys: 0,
            ai_content: 0,
            market_analysis: 0,
            image_analysis: 0,
            memory_usage: null,
            valid_entries: 0,
            invalid_entries: 0
        };
        
        for (const pattern of patterns) {
            const keys = await client.keys(pattern);
            stats.total_keys += keys.length;
            
            if (pattern === 'ai:*') stats.ai_content = keys.length;
            else if (pattern === 'market:*') stats.market_analysis = keys.length;
            else if (pattern === 'image:*') stats.image_analysis = keys.length;
            
            // Check validity of cached data
            for (const key of keys) {
                const value = await client.get(key);
                if (value) {
                    try {
                        const parsed = JSON.parse(value);
                        const keyType = key.startsWith('ai:') ? 'ai_content' : 
                                      key.startsWith('market:') ? 'market' : 
                                      key.startsWith('image:') ? 'image_analysis' : 'general';
                        
                        if (cache.isValidCacheData && cache.isValidCacheData(parsed, keyType)) {
                            stats.valid_entries++;
                        } else {
                            stats.invalid_entries++;
                        }
                    } catch (parseError) {
                        stats.invalid_entries++;
                    }
                }
            }
        }
        
        // Get memory usage
        try {
            const info = await client.info('memory');
            const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
            if (memoryMatch) {
                stats.memory_usage = memoryMatch[1].trim();
            }
        } catch (memError) {
            logger.warn('Could not retrieve memory usage:', memError.message);
        }
        
        return stats;
    } catch (error) {
        logger.error('Error getting cache stats:', error);
        return null;
    }
};

// Optimize cache by removing least recently used data when near memory limit
const optimizeCache = async (maxMemoryMB = 100) => {
    try {
        const stats = await getCacheStats();
        if (!stats) return 0;
        
        // Simple optimization: remove invalid entries first
        let optimizedCount = await cleanupInvalidData();
        
        // If still need space, remove oldest market data (most volatile)
        const client = cache.getRedisClient();
        const marketKeys = await client.keys('market:*');
        
        if (marketKeys.length > 100) { // If too many market entries
            // Get TTL for each and remove oldest
            const keyTTLs = [];
            for (const key of marketKeys) {
                const ttl = await client.ttl(key);
                keyTTLs.push({ key, ttl });
            }
            
            // Sort by TTL (lowest TTL = oldest)
            keyTTLs.sort((a, b) => a.ttl - b.ttl);
            
            // Remove oldest 25%
            const toRemove = Math.floor(keyTTLs.length * 0.25);
            for (let i = 0; i < toRemove; i++) {
                await client.del(keyTTLs[i].key);
                optimizedCount++;
            }
        }
        
        logger.info(`Cache optimization completed. Removed ${optimizedCount} entries.`);
        return optimizedCount;
    } catch (error) {
        logger.error('Error optimizing cache:', error);
        return 0;
    }
};

// Schedule automatic cleanup (to be called from a cron job or interval)
const scheduleCleanup = (intervalHours = 6) => {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
        logger.info('Running scheduled cache cleanup...');
        await cleanupInvalidData();
        await cleanupExpiredData();
        
        // Optimize if too many entries
        const stats = await getCacheStats();
        if (stats && stats.total_keys > 1000) {
            await optimizeCache();
        }
    }, intervalMs);
    
    logger.info(`Scheduled cache cleanup every ${intervalHours} hours`);
};

module.exports = {
    cleanupInvalidData,
    cleanupExpiredData,
    getCacheStats,
    optimizeCache,
    scheduleCleanup
};
