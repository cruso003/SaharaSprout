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
            logger.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('Redis Client Connected');
        });

        redisClient.on('ready', () => {
            logger.info('Redis Client Ready');
        });

        await redisClient.connect();
        
        // Test connection
        await redisClient.ping();
        logger.info('Redis connection established successfully');
        
        return redisClient;
    } catch (error) {
        logger.error('Redis connection failed:', error.message);
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
        logger.error('Redis health check failed:', error.message);
        return false;
    }
};

// Cache operations
const cache = {
    get: async (key) => {
        try {
            const client = getRedisClient();
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Cache get error:', error.message);
            return null;
        }
    },

    set: async (key, value, ttl = 3600) => {
        try {
            const client = getRedisClient();
            const serialized = JSON.stringify(value);
            await client.setEx(key, ttl, serialized);
            return true;
        } catch (error) {
            logger.error('Cache set error:', error.message);
            return false;
        }
    },

    del: async (key) => {
        try {
            const client = getRedisClient();
            await client.del(key);
            return true;
        } catch (error) {
            logger.error('Cache delete error:', error.message);
            return false;
        }
    },

    invalidatePattern: async (pattern) => {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
            return true;
        } catch (error) {
            logger.error('Cache pattern invalidation error:', error.message);
            return false;
        }
    }
};

// Close connection
const closeRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.quit();
            logger.info('Redis connection closed');
        }
    } catch (error) {
        logger.error('Error closing Redis connection:', error.message);
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    healthCheck,
    cache,
    closeRedis
};
