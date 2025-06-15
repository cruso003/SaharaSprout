const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

// Different rate limits for different AI services based on cost and complexity
const AI_SERVICE_LIMITS = {
    // Text generation (relatively cheap)
    'description_generation': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // 50 requests per hour
        cost_per_request: 0.01 // $0.01 estimated cost
    },
    'marketing_copy': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 30, // 30 requests per hour
        cost_per_request: 0.02
    },
    
    // Image generation (expensive)
    'image_generation': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Only 10 AI image generations per hour
        cost_per_request: 0.50 // $0.50 per image
    },
    
    // Image analysis (moderate cost)
    'crop_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 25, // 25 analyses per hour
        cost_per_request: 0.05
    },
    
    // Market analysis (data intensive)
    'market_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour
        cost_per_request: 0.03
    },

    // Agricultural Intelligence Services
    // Irrigation Services (water-related AI analysis)
    'water_prediction': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 30, // 30 requests per hour
        cost_per_request: 0.04
    },
    'irrigation_optimization': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 25, // 25 requests per hour
        cost_per_request: 0.06
    },

    // Crop Management Services
    'crop_recommendations': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 40, // 40 requests per hour
        cost_per_request: 0.03
    },
    'pest_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour (image processing intensive)
        cost_per_request: 0.08
    },
    'harvest_optimization': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 25, // 25 requests per hour
        cost_per_request: 0.05
    },
    'yield_prediction': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour (complex ML models)
        cost_per_request: 0.10
    },

    // Weather Services
    'weather_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // 50 requests per hour (frequent updates needed)
        cost_per_request: 0.02
    },
    'climate_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 15, // 15 requests per hour (complex climate modeling)
        cost_per_request: 0.12
    },
    'disaster_assessment': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 requests per hour (emergency use, expensive processing)
        cost_per_request: 0.15
    },
    'stress_prediction': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 30, // 30 requests per hour
        cost_per_request: 0.06
    },
    'seasonal_planning': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour (comprehensive planning)
        cost_per_request: 0.08
    },

    // Farm Management Services
    'financial_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 25, // 25 requests per hour
        cost_per_request: 0.07
    },
    'zone_optimization': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour (complex spatial analysis)
        cost_per_request: 0.09
    },
    'supply_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 30, // 30 requests per hour
        cost_per_request: 0.05
    },
    'benchmarking': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 15, // 15 requests per hour (data-intensive comparisons)
        cost_per_request: 0.08
    },
    'sustainability_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour
        cost_per_request: 0.07
    },

    // Language Services
    'translation': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 100, // 100 requests per hour (high frequency use)
        cost_per_request: 0.01
    },
    'localized_content': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // 50 requests per hour
        cost_per_request: 0.03
    },
    'voice_processing': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 30, // 30 requests per hour (audio processing)
        cost_per_request: 0.05
    },
    'cultural_adaptation': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 25, // 25 requests per hour
        cost_per_request: 0.04
    },

    // Data Processing Services (for ESP32 data)
    'sensor_analysis': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 200, // 200 requests per hour (high frequency sensor data)
        cost_per_request: 0.005
    },
    'batch_processing': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // 50 requests per hour
        cost_per_request: 0.02
    }
};

// User tier limits (can be based on subscription/plan)
const USER_TIER_MULTIPLIERS = {
    'free': 1.0,        // Standard limits
    'basic': 2.0,       // 2x limits
    'premium': 5.0,     // 5x limits
    'enterprise': 10.0  // 10x limits
};

// Daily cost limits per user tier
const DAILY_COST_LIMITS = {
    'free': 2.00,       // $2 per day
    'basic': 10.00,     // $10 per day
    'premium': 50.00,   // $50 per day
    'enterprise': 200.00 // $200 per day
};

// Create rate limiter for specific AI service
const createAIRateLimiter = (serviceType) => {
    const limits = AI_SERVICE_LIMITS[serviceType];
    
    if (!limits) {
        throw new Error(`Unknown AI service type: ${serviceType}`);
    }

    return rateLimit({
        windowMs: limits.windowMs,
        max: async (req) => {
            // Get user tier (default to free if not specified)
            const userTier = req.user?.tier || 'free';
            const multiplier = USER_TIER_MULTIPLIERS[userTier] || 1.0;
            
            // Calculate max requests based on user tier
            return Math.floor(limits.max * multiplier);
        },
        
        // Custom key generator to include service type and user ID
        keyGenerator: (req) => {
            const userId = req.user?.id || req.ip;
            return `ai_limit:${serviceType}:${userId}`;
        },
        
        standardHeaders: true,
        legacyHeaders: false,
        
        // Custom message function that also logs rate limit events
        message: (req, res) => {
            const userId = req.user?.id;
            if (userId) {
                logger.warn(`Rate limit reached for AI service`, {
                    userId,
                    serviceType,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
            }
            
            return {
                error: 'Too many requests',
                message: `Rate limit exceeded for ${serviceType}. Please try again later.`,
                service: serviceType,
                limit: res.getHeader('X-RateLimit-Limit'),
                window: `${limits.windowMs / 1000 / 60} minutes`,
                reset_time: new Date(Date.now() + limits.windowMs).toISOString(),
                tier: req.user?.tier || 'free',
                cost_per_request: limits.cost_per_request
            };
        }
    });
};

// Middleware to check daily cost limits before processing AI requests
const checkCostLimits = () => {
    return async (req, res, next) => {
        const userId = req.user?.id;
        const userTier = req.user?.tier || 'free';
        
        if (userId) {
            try {
                // Check daily cost limit
                const todayCost = await getDailyCost(userId);
                const costLimit = DAILY_COST_LIMITS[userTier];
                
                if (todayCost >= costLimit) {
                    logger.warn(`User ${userId} exceeded daily cost limit`, {
                        userId,
                        todayCost,
                        costLimit,
                        userTier
                    });
                    
                    return res.status(429).json({
                        success: false,
                        error: 'DAILY_COST_LIMIT_EXCEEDED',
                        message: 'Daily AI usage cost limit exceeded',
                        details: {
                            current_cost: todayCost,
                            daily_limit: costLimit,
                            tier: userTier,
                            reset_time: getNextResetTime(),
                            upgrade_info: 'Consider upgrading your plan for higher limits'
                        }
                    });
                }
            } catch (error) {
                logger.error('Error checking cost limits:', error);
                // Continue on error to not block the request
            }
        }
        
        next();
    };
};

// Get user's daily AI cost
const getDailyCost = async (userId) => {
    try {
        const redis = getRedisClient();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const costKey = `daily_ai_cost:${userId}:${today}`;
        
        const cost = await redis.get(costKey);
        return parseFloat(cost) || 0;
    } catch (error) {
        logger.error('Error getting daily cost:', error);
        return 0;
    }
};

// Track AI usage cost
const trackAIUsage = async (userId, serviceType, cost = 0) => {
    try {
        const redis = getRedisClient();
        const today = new Date().toISOString().split('T')[0];
        const costKey = `daily_ai_cost:${userId}:${today}`;
        const usageKey = `daily_ai_usage:${userId}:${today}:${serviceType}`;
        
        // Increment daily cost
        await redis.incrByFloat(costKey, cost);
        await redis.expire(costKey, 24 * 60 * 60); // Expire after 24 hours
        
        // Increment service usage count
        await redis.incr(usageKey);
        await redis.expire(usageKey, 24 * 60 * 60);
        
        logger.info(`AI usage tracked`, {
            userId,
            serviceType,
            cost,
            date: today
        });
        
    } catch (error) {
        logger.error('Error tracking AI usage:', error);
    }
};

// Get next reset time (start of next hour)
const getNextResetTime = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.toISOString();
};

// Middleware to track AI costs after successful requests
const trackAICost = (serviceType) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Only track cost for successful requests
            if (res.statusCode === 200 || res.statusCode === 201) {
                const userId = req.user?.id;
                if (userId) {
                    const limits = AI_SERVICE_LIMITS[serviceType];
                    if (limits) {
                        // Track usage asynchronously
                        setImmediate(() => {
                            trackAIUsage(userId, serviceType, limits.cost_per_request);
                        });
                    }
                }
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

// Get user's current usage and limits
const getUsageStats = async (userId) => {
    try {
        const redis = getRedisClient();
        const today = new Date().toISOString().split('T')[0];
        const costKey = `daily_ai_cost:${userId}:${today}`;
        
        const todayCost = await getDailyCost(userId);
        
        // Get usage counts for each service
        const usageStats = {};
        for (const serviceType of Object.keys(AI_SERVICE_LIMITS)) {
            const usageKey = `daily_ai_usage:${userId}:${today}:${serviceType}`;
            const count = await redis.get(usageKey);
            usageStats[serviceType] = parseInt(count) || 0;
        }
        
        return {
            daily_cost: todayCost,
            usage_by_service: usageStats,
            date: today
        };
        
    } catch (error) {
        logger.error('Error getting usage stats:', error);
        return {
            daily_cost: 0,
            usage_by_service: {},
            date: new Date().toISOString().split('T')[0]
        };
    }
};

// Warning thresholds (percentage of limit)
const WARNING_THRESHOLDS = {
    cost: 0.8,    // Warn at 80% of cost limit
    requests: 0.9  // Warn at 90% of request limit
};

// Check if user should be warned about approaching limits
const checkWarningThresholds = async (userId, userTier = 'free') => {
    const stats = await getUsageStats(userId);
    const costLimit = DAILY_COST_LIMITS[userTier];
    const warnings = [];
    
    // Check cost warning
    if (stats.daily_cost / costLimit >= WARNING_THRESHOLDS.cost) {
        warnings.push({
            type: 'cost',
            message: `You've used ${(stats.daily_cost / costLimit * 100).toFixed(1)}% of your daily AI budget`,
            current: stats.daily_cost,
            limit: costLimit
        });
    }
    
    // Check service-specific warnings
    const tierMultiplier = USER_TIER_MULTIPLIERS[userTier];
    for (const [serviceType, limits] of Object.entries(AI_SERVICE_LIMITS)) {
        const usage = stats.usage_by_service[serviceType] || 0;
        const limit = Math.floor(limits.max * tierMultiplier);
        
        if (usage / limit >= WARNING_THRESHOLDS.requests) {
            warnings.push({
                type: 'service',
                service: serviceType,
                message: `You've used ${usage}/${limit} ${serviceType.replace('_', ' ')} requests today`,
                current: usage,
                limit: limit
            });
        }
    }
    
    return warnings;
};

module.exports = {
    createAIRateLimiter,
    checkCostLimits,
    trackAICost,
    trackAIUsage,
    getDailyCost,
    getUsageStats,
    checkWarningThresholds,
    AI_SERVICE_LIMITS,
    USER_TIER_MULTIPLIERS,
    DAILY_COST_LIMITS
};
