const Order = require('../models/Order');
const { query: queryValidator, validationResult } = require('express-validator');
const { getCachedAnalytics, cacheOrderAnalytics } = require('../config/redis');

// Helper function to check validation results
function checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details: errors.array().map(err => err.msg)
            }
        });
    }
    next();
}

// Get order analytics dashboard
const getOrderAnalytics = [
    queryValidator('timeframe').optional().isIn(['7 days', '30 days', '90 days', '1 year']),
    checkValidation,
    async (req, res, next) => {
        try {
            const { timeframe = '30 days' } = req.query;
            const cacheKey = `order_analytics_${timeframe}`;

            // Try to get from cache first
            let analytics = await getCachedAnalytics(cacheKey);

            if (!analytics) {
                // Get order statistics
                const orderStats = await Order.getOrderStats(timeframe);
                
                // Get top products
                const topProducts = await Order.getTopProducts(10);

                // Get AI-powered insights
                const insights = await getAIOrderInsights(orderStats, timeframe);

                analytics = {
                    overview: {
                        totalOrders: parseInt(orderStats.total_orders),
                        completedOrders: parseInt(orderStats.completed_orders),
                        pendingOrders: parseInt(orderStats.pending_orders),
                        cancelledOrders: parseInt(orderStats.cancelled_orders),
                        totalRevenue: parseFloat(orderStats.total_revenue),
                        averageOrderValue: parseFloat(orderStats.average_order_value),
                        completionRate: orderStats.total_orders > 0 
                            ? (orderStats.completed_orders / orderStats.total_orders * 100).toFixed(2)
                            : 0,
                        cancellationRate: orderStats.total_orders > 0
                            ? (orderStats.cancelled_orders / orderStats.total_orders * 100).toFixed(2)
                            : 0
                    },
                    topProducts,
                    trends: {
                        timeframe,
                        currency: 'XOF'
                    },
                    aiInsights: insights,
                    generatedAt: new Date().toISOString()
                };

                // Cache for 5 minutes
                await cacheOrderAnalytics(cacheKey, analytics, 300);
            }

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get demand forecasting
const getDemandForecast = [
    queryValidator('productId').optional().isUUID(),
    queryValidator('category').optional().isString(),
    queryValidator('timeframe').optional().isIn(['7 days', '30 days', '90 days']),
    checkValidation,
    async (req, res, next) => {
        try {
            const { productId, category, timeframe = '30 days' } = req.query;
            const cacheKey = `demand_forecast_${productId || category || 'all'}_${timeframe}`;

            let forecast = await getCachedAnalytics(cacheKey);

            if (!forecast) {
                // Generate AI-powered demand forecast
                forecast = await generateDemandForecast({ productId, category, timeframe });
                
                // Cache for 1 hour
                await cacheOrderAnalytics(cacheKey, forecast, 3600);
            }

            res.json({
                success: true,
                data: forecast
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get seasonal trends
const getSeasonalTrends = [
    queryValidator('year').optional().isInt({ min: 2020, max: 2030 }),
    checkValidation,
    async (req, res, next) => {
        try {
            const { year = new Date().getFullYear() } = req.query;
            const cacheKey = `seasonal_trends_${year}`;

            let trends = await getCachedAnalytics(cacheKey);

            if (!trends) {
                trends = await generateSeasonalTrends(year);
                
                // Cache for 24 hours
                await cacheOrderAnalytics(cacheKey, trends, 86400);
            }

            res.json({
                success: true,
                data: trends
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get farmer performance analytics
const getFarmerAnalytics = [
    queryValidator('farmId').optional().isUUID(),
    queryValidator('timeframe').optional().isIn(['7 days', '30 days', '90 days', '1 year']),
    checkValidation,
    async (req, res, next) => {
        try {
            const { farmId, timeframe = '30 days' } = req.query;
            
            // If farmId not provided, use the authenticated user's farm
            const targetFarmId = farmId || req.user.farmId;

            if (!targetFarmId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Farm ID is required',
                        status: 400
                    }
                });
            }

            // Check access permissions
            if (req.user.role !== 'admin' && req.user.farmId !== targetFarmId) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied to farm analytics',
                        status: 403
                    }
                });
            }

            const cacheKey = `farmer_analytics_${targetFarmId}_${timeframe}`;
            let analytics = await getCachedAnalytics(cacheKey);

            if (!analytics) {
                analytics = await generateFarmerAnalytics(targetFarmId, timeframe);
                
                // Cache for 15 minutes
                await cacheOrderAnalytics(cacheKey, analytics, 900);
            }

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            next(error);
        }
    }
];

// AI-powered order insights
async function getAIOrderInsights(orderStats, timeframe) {
    try {
        const insights = {
            performanceScore: calculatePerformanceScore(orderStats),
            recommendations: [],
            marketTrends: {
                demandLevel: 'moderate',
                seasonalFactor: 'wet_season',
                competitivePosition: 'strong'
            },
            growthOpportunities: []
        };

        // Generate recommendations based on order stats
        if (parseFloat(orderStats.cancellation_rate) > 10) {
            insights.recommendations.push({
                type: 'operational',
                priority: 'high',
                message: 'High cancellation rate detected. Review order fulfillment process.',
                action: 'Improve delivery reliability and communication'
            });
        }

        if (parseFloat(orderStats.average_order_value) < 2000) {
            insights.recommendations.push({
                type: 'revenue',
                priority: 'medium',
                message: 'Low average order value. Consider bundle deals.',
                action: 'Create product bundles and minimum order incentives'
            });
        }

        if (parseInt(orderStats.total_orders) > 50) {
            insights.growthOpportunities.push({
                opportunity: 'Scale operations',
                potential: 'high',
                description: 'Strong order volume indicates potential for expansion'
            });
        }

        return insights;
    } catch (error) {
        console.error('AI insights error:', error);
        return {
            performanceScore: 75,
            recommendations: [],
            marketTrends: {},
            growthOpportunities: []
        };
    }
}

function calculatePerformanceScore(stats) {
    let score = 50; // Base score

    // Completion rate impact (0-30 points)
    const completionRate = stats.total_orders > 0 
        ? (stats.completed_orders / stats.total_orders) 
        : 0;
    score += completionRate * 30;

    // Order volume impact (0-20 points)
    if (stats.total_orders > 100) score += 20;
    else if (stats.total_orders > 50) score += 15;
    else if (stats.total_orders > 20) score += 10;
    else if (stats.total_orders > 5) score += 5;

    // Revenue impact (0-20 points)
    if (stats.total_revenue > 100000) score += 20;
    else if (stats.total_revenue > 50000) score += 15;
    else if (stats.total_revenue > 20000) score += 10;
    else if (stats.total_revenue > 5000) score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
}

async function generateDemandForecast({ productId, category, timeframe }) {
    // Mock demand forecasting - in production, this would use ML models
    return {
        forecast: {
            nextWeek: {
                expectedOrders: 25,
                confidence: 0.85,
                trend: 'increasing'
            },
            nextMonth: {
                expectedOrders: 120,
                confidence: 0.75,
                trend: 'stable'
            }
        },
        seasonalFactors: {
            currentSeason: 'wet_season',
            demandMultiplier: 1.3,
            peakMonths: ['June', 'July', 'August']
        },
        recommendations: [
            'Stock up on seasonal vegetables',
            'Prepare for increased demand in wet season'
        ],
        generatedAt: new Date().toISOString()
    };
}

async function generateSeasonalTrends(year) {
    // Mock seasonal trends - in production, this would analyze historical data
    return {
        year,
        trends: {
            wetSeason: {
                months: ['May', 'June', 'July', 'August', 'September'],
                demandIncrease: 35,
                topProducts: ['leafy_greens', 'tomatoes', 'peppers']
            },
            drySeason: {
                months: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
                demandIncrease: -15,
                topProducts: ['root_vegetables', 'preserved_goods']
            }
        },
        recommendations: [
            'Focus on greenhouse production during dry season',
            'Maximize field production during wet season'
        ],
        generatedAt: new Date().toISOString()
    };
}

async function generateFarmerAnalytics(farmId, timeframe) {
    // Mock farmer analytics - in production, this would aggregate real farm data
    return {
        farmId,
        timeframe,
        performance: {
            orderFulfillmentRate: 94.5,
            averageDeliveryTime: 2.3, // days
            customerSatisfaction: 4.7,
            returnCustomerRate: 68.2
        },
        sales: {
            totalOrders: 45,
            totalRevenue: 67500,
            averageOrderValue: 1500,
            topSellingProducts: [
                { productId: 'tomato-001', name: 'Fresh Tomatoes', orders: 12 },
                { productId: 'pepper-001', name: 'Bell Peppers', orders: 8 }
            ]
        },
        insights: {
            bestPerformingProducts: ['tomatoes', 'peppers'],
            improvementAreas: ['delivery_speed', 'product_variety'],
            seasonalOpportunities: ['expand_greenhouse', 'add_herbs']
        },
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    getOrderAnalytics,
    getDemandForecast,
    getSeasonalTrends,
    getFarmerAnalytics
};
