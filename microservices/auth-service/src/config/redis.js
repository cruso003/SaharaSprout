const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    const config = {
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max retry attempts reached');
          return undefined;
        }
        // Reconnect after
        return Math.min(options.attempt * 100, 3000);
      }
    };

    redisClient = redis.createClient(config);

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    
    // Test Redis connection
    await redisClient.ping();
    logger.info('Redis connection established successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Redis utility functions
const setCache = async (key, value, expireInSeconds = 3600) => {
  try {
    const client = getRedisClient();
    await client.setEx(key, expireInSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error('Redis SET error:', error);
    throw error;
  }
};

const getCache = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error('Redis DELETE error:', error);
    throw error;
  }
};

const setCacheHash = async (key, field, value, expireInSeconds = 3600) => {
  try {
    const client = getRedisClient();
    await client.hSet(key, field, JSON.stringify(value));
    await client.expire(key, expireInSeconds);
  } catch (error) {
    logger.error('Redis HSET error:', error);
    throw error;
  }
};

const getCacheHash = async (key, field) => {
  try {
    const client = getRedisClient();
    const value = await client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis HGET error:', error);
    return null;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedis,
  setCache,
  getCache,
  deleteCache,
  setCacheHash,
  getCacheHash
};
