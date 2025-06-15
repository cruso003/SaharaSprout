const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
    try {
        redisClient = Redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryDelayOnFailover: 100,
            enableReadyCheck: true,
            maxRetriesPerRequest: 3,
        });

        redisClient.on('error', (err) => {
            logger.error('AI Service Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('AI Service Redis Client Connected');
        });

        redisClient.on('ready', () => {
            logger.info('AI Service Redis Client Ready');
        });

        await redisClient.connect();
        
        // Test connection
        await redisClient.ping();
        logger.info('AI Service Redis connection established successfully');
        
        return redisClient;
    } catch (error) {
        logger.error('AI Service Redis connection failed:', error.message);
        throw error;
    }
};

const getRedisClient = () => {
    if (!redisClient || !redisClient.isOpen) {
        throw new Error('Redis client not connected');
    }
    return redisClient;
};

// Health check
const healthCheck = async () => {
    try {
        if (!redisClient || !redisClient.isOpen) {
            return false;
        }
        const result = await redisClient.ping();
        return result === 'PONG';
    } catch (error) {
        logger.error('AI Service Redis health check failed:', error.message);
        return false;
    }
};

// Smart cache validation functions
const isValidCacheData = (data, type = 'general') => {
    if (!data || data === null || data === undefined) {
        return false;
    }

    // Check for error objects
    if (data.error || data.isError || (data.success === false && data.message)) {
        return false;
    }

    // Type-specific validations
    switch (type) {
        case 'market':
            return isValidMarketData(data);
        case 'ai_content':
            return isValidAIContent(data);
        case 'image_analysis':
            return isValidImageAnalysis(data);
        default:
            return isValidGeneralData(data);
    }
};

const isValidGeneralData = (data) => {
    // Basic validation for general data
    if (typeof data === 'string' && data.trim().length === 0) {
        return false;
    }
    if (Array.isArray(data) && data.length === 0) {
        return false;
    }
    if (typeof data === 'object' && Object.keys(data).length === 0) {
        return false;
    }
    return true;
};

const isValidMarketData = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Market data should have meaningful content
    const requiredFields = ['trends', 'analysis', 'insights'];
    const hasValidContent = requiredFields.some(field => 
        data[field] && (
            (typeof data[field] === 'string' && data[field].trim().length > 10) ||
            (Array.isArray(data[field]) && data[field].length > 0) ||
            (typeof data[field] === 'object' && Object.keys(data[field]).length > 0)
        )
    );
    
    return hasValidContent;
};

const isValidAIContent = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // AI content should have meaningful text
    const contentFields = ['description', 'content', 'text', 'result', 'response'];
    const hasValidContent = contentFields.some(field => 
        data[field] && typeof data[field] === 'string' && data[field].trim().length > 5
    );
    
    // Check for product generation specific fields
    if (data.productName || data.marketingCopy || data.images) {
        return (data.productName && data.productName.trim().length > 0) ||
               (data.marketingCopy && data.marketingCopy.trim().length > 0) ||
               (data.images && Array.isArray(data.images) && data.images.length > 0);
    }
    
    return hasValidContent;
};

const isValidImageAnalysis = (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Image analysis should have meaningful results
    const analysisFields = ['analysis', 'results', 'issues', 'recommendations', 'growthStage'];
    const hasValidAnalysis = analysisFields.some(field => 
        data[field] && (
            (typeof data[field] === 'string' && data[field].trim().length > 5) ||
            (Array.isArray(data[field]) && data[field].length > 0) ||
            (typeof data[field] === 'object' && Object.keys(data[field]).length > 0)
        )
    );
    
    return hasValidAnalysis;
};

// AI-specific cache operations with longer TTLs for expensive operations and smart validation
const cache = {
    get: async (key) => {
        try {
            const client = getRedisClient();
            const value = await client.get(key);
            if (!value) return null;
            
            const parsed = JSON.parse(value);
            
            // Validate cached data before returning
            if (!isValidCacheData(parsed)) {
                logger.warn(`Invalid cached data found for key: ${key}, removing from cache`);
                await cache.del(key);
                return null;
            }
            
            return parsed;
        } catch (error) {
            logger.error('AI Cache get error:', error.message);
            return null;
        }
    },

    set: async (key, value, ttl = 3600, type = 'general') => {
        try {
            // Validate data before caching
            if (!isValidCacheData(value, type)) {
                logger.warn(`Attempted to cache invalid data for key: ${key}, skipping cache operation`);
                return false;
            }
            
            const client = getRedisClient();
            const serialized = JSON.stringify(value);
            await client.setEx(key, ttl, serialized);
            logger.debug(`Successfully cached valid data for key: ${key}`);
            return true;
        } catch (error) {
            logger.error('AI Cache set error:', error.message);
            return false;
        }
    },

    // Cache market analysis for longer periods with validation
    setMarketAnalysis: async (key, value, ttl = 3600) => {
        return await cache.set(`market:${key}`, value, ttl, 'market');
    },

    getMarketAnalysis: async (key) => {
        return await cache.get(`market:${key}`);
    },

    // Cache AI generated content with validation
    setAIContent: async (key, value, ttl = 86400) => { // 24 hours
        return await cache.set(`ai:${key}`, value, ttl, 'ai_content');
    },

    getAIContent: async (key) => {
        return await cache.get(`ai:${key}`);
    },

    // Cache image analysis results with validation
    setImageAnalysis: async (key, value, ttl = 7200) => { // 2 hours
        return await cache.set(`image:${key}`, value, ttl, 'image_analysis');
    },

    getImageAnalysis: async (key) => {
        return await cache.get(`image:${key}`);
    },

    del: async (key) => {
        try {
            const client = getRedisClient();
            await client.del(key);
            logger.debug(`Deleted cache key: ${key}`);
            return true;
        } catch (error) {
            logger.error('AI Cache delete error:', error.message);
            return false;
        }
    },

    invalidatePattern: async (pattern) => {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
            }
            return true;
        } catch (error) {
            logger.error('AI Cache pattern invalidation error:', error.message);
            return false;
        }
    },

    // Batch operations for better performance
    batchSet: async (keyValuePairs, ttl = 3600, type = 'general') => {
        try {
            const client = getRedisClient();
            const pipeline = client.multi();
            
            let validCount = 0;
            for (const [key, value] of keyValuePairs) {
                if (isValidCacheData(value, type)) {
                    pipeline.setEx(key, ttl, JSON.stringify(value));
                    validCount++;
                } else {
                    logger.warn(`Skipping invalid data in batch set for key: ${key}`);
                }
            }
            
            if (validCount > 0) {
                await pipeline.exec();
                logger.debug(`Batch cached ${validCount} valid items out of ${keyValuePairs.length} total`);
            }
            
            return validCount;
        } catch (error) {
            logger.error('AI Cache batch set error:', error.message);
            return 0;
        }
    },

    // Cache health and cleanup
    cleanupInvalidData: async () => {
        try {
            const client = getRedisClient();
            const patterns = ['ai:*', 'market:*', 'image:*'];
            let cleanedCount = 0;
            
            for (const pattern of patterns) {
                const keys = await client.keys(pattern);
                for (const key of keys) {
                    const value = await client.get(key);
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            const keyType = key.startsWith('ai:') ? 'ai_content' : 
                                          key.startsWith('market:') ? 'market' : 
                                          key.startsWith('image:') ? 'image_analysis' : 'general';
                            
                            if (!isValidCacheData(parsed, keyType)) {
                                await client.del(key);
                                cleanedCount++;
                            }
                        } catch (parseError) {
                            // Invalid JSON, delete it
                            await client.del(key);
                            cleanedCount++;
                        }
                    }
                }
            }
            
            if (cleanedCount > 0) {
                logger.info(`Cleaned up ${cleanedCount} invalid cache entries`);
            }
            
            return cleanedCount;
        } catch (error) {
            logger.error('AI Cache cleanup error:', error.message);
            return 0;
        }
    }
};

// Close connection
const closeRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.quit();
            logger.info('AI Service Redis connection closed');
        }
    } catch (error) {
        logger.error('Error closing AI Service Redis connection:', error.message);
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    healthCheck,
    cache,
    closeRedis,
    // Export validation functions for use in other services
    isValidCacheData,
    isValidMarketData,
    isValidAIContent,
    isValidImageAnalysis
};
