const { createClient } = require('redis');

let redisClient = null;

async function connectRedis() {
    try {
        redisClient = createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            database: process.env.REDIS_DB || 2, // Use different DB for orders
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('🔗 Connected to Redis');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis ready for operations');
        });

        await redisClient.connect();
        console.log('✅ Redis connection established for Order Service');
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        throw error;
    }
}

function getRedisClient() {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
}

// Cart operations
async function getCartItems(userId) {
    try {
        const key = `cart:${userId}`;
        const items = await redisClient.hGetAll(key);
        return Object.entries(items).map(([productId, data]) => ({
            productId,
            ...JSON.parse(data)
        }));
    } catch (error) {
        console.error('Redis getCartItems error:', error);
        return [];
    }
}

async function addToCart(userId, productId, quantity, productData) {
    try {
        const key = `cart:${userId}`;
        const data = {
            quantity,
            addedAt: new Date().toISOString(),
            productData
        };
        await redisClient.hSet(key, productId, JSON.stringify(data));
        // Set expiry for cart (30 days)
        await redisClient.expire(key, 30 * 24 * 60 * 60);
        return true;
    } catch (error) {
        console.error('Redis addToCart error:', error);
        return false;
    }
}

async function updateCartItem(userId, productId, quantity) {
    try {
        const key = `cart:${userId}`;
        const existingData = await redisClient.hGet(key, productId);
        if (!existingData) return false;
        
        const data = JSON.parse(existingData);
        data.quantity = quantity;
        data.updatedAt = new Date().toISOString();
        
        await redisClient.hSet(key, productId, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Redis updateCartItem error:', error);
        return false;
    }
}

async function removeFromCart(userId, productId) {
    try {
        const key = `cart:${userId}`;
        const result = await redisClient.hDel(key, productId);
        return result > 0;
    } catch (error) {
        console.error('Redis removeFromCart error:', error);
        return false;
    }
}

async function clearCart(userId) {
    try {
        const key = `cart:${userId}`;
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error('Redis clearCart error:', error);
        return false;
    }
}

// Order analytics caching
async function cacheOrderAnalytics(key, data, ttl = 300) {
    try {
        await redisClient.setEx(`analytics:${key}`, ttl, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Redis cacheOrderAnalytics error:', error);
        return false;
    }
}

async function getCachedAnalytics(key) {
    try {
        const data = await redisClient.get(`analytics:${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis getCachedAnalytics error:', error);
        return null;
    }
}

module.exports = {
    connectRedis,
    getRedisClient,
    getCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cacheOrderAnalytics,
    getCachedAnalytics
};
