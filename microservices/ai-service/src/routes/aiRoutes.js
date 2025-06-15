const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { verifyToken, requireFarmer } = require('../middleware/auth');
const {
    createAIRateLimiter,
    trackAICost,
    getUsageStats,
    checkWarningThresholds
} = require('../middleware/aiRateLimit');
const {
    generateProductDescription,
    generateMarketingCopy,
    generateProductImage,
    analyzeCropImage
} = require('../services/aiService');
const logger = require('../utils/logger');

// Configure multer for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.SUPPORTED_IMAGE_FORMATS || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Generate product description
router.post('/generate/description', 
    verifyToken,
    requireFarmer,
    createAIRateLimiter('description_generation'),
    trackAICost('description_generation'),
    [
        body('name').notEmpty().withMessage('Product name is required'),
        body('category').notEmpty().withMessage('Product category is required'),
        body('origin').optional().isString(),
        body('isOrganic').optional().isBoolean(),
        body('harvestDate').optional().isISO8601(),
        body('features').optional().isString()
    ],
    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const result = await generateProductDescription(req.body);

            // Check and send usage warnings if approaching limits
            const warnings = await checkWarningThresholds(req.user.id, req.user.tier);
            
            res.json({
                success: true,
                message: 'Product description generated successfully',
                data: result,
                warnings: warnings.length > 0 ? warnings : undefined
            });

        } catch (error) {
            logger.error('Error in generate description endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate product description',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Generate marketing copy
router.post('/generate/marketing',
    verifyToken,
    requireFarmer,
    createAIRateLimiter('marketing_copy'),
    trackAICost('marketing_copy'),
    [
        body('name').notEmpty().withMessage('Product name is required'),
        body('category').notEmpty().withMessage('Product category is required'),
        body('copyType').optional().isIn(['social_media', 'email_campaign', 'product_listing']),
        body('benefits').optional().isString(),
        body('targetAudience').optional().isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { copyType = 'social_media', ...productData } = req.body;
            const result = await generateMarketingCopy(productData, copyType);

            res.json({
                success: true,
                message: 'Marketing copy generated successfully',
                data: result
            });

        } catch (error) {
            logger.error('Error in generate marketing endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate marketing copy',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Generate product image
router.post('/generate/image',
    verifyToken,
    requireFarmer,
    createAIRateLimiter('image_generation'),
    trackAICost('image_generation'),
    [
        body('productName').notEmpty().withMessage('Product name is required'),
        body('category').notEmpty().withMessage('Product category is required'),
        body('style').optional().isIn(['professional', 'rustic', 'modern', 'natural']),
        body('background').optional().isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const result = await generateProductImage(req.body);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Product image generated successfully',
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to generate product image',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Error in generate image endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate product image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Analyze crop image
router.post('/analyze/crop',
    verifyToken,
    requireFarmer,
    createAIRateLimiter('crop_analysis'),
    trackAICost('crop_analysis'),
    upload.single('image'),
    [
        body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
        body('analysisType').optional().isIn(['health', 'quality', 'pest', 'general'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            let imageUrl = req.body.imageUrl;

            // If image file is uploaded, we would upload it to Cloudinary first
            if (req.file && !imageUrl) {
                // In a real implementation, upload to Cloudinary here
                // For now, we'll just use a placeholder
                return res.status(400).json({
                    success: false,
                    message: 'Image upload not implemented yet. Please provide imageUrl.'
                });
            }

            if (!imageUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Either image file or imageUrl is required'
                });
            }

            const analysisType = req.body.analysisType || 'general';
            const result = await analyzeCropImage(imageUrl, analysisType);

            res.json({
                success: true,
                message: 'Crop image analyzed successfully',
                data: result
            });

        } catch (error) {
            logger.error('Error in analyze crop endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze crop image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Get AI usage analytics for user
router.get('/analytics/usage',
    verifyToken,
    async (req, res) => {
        try {
            const { period = '30' } = req.query;
            const userId = req.user.id;
            const userTier = req.user.tier || 'free';

            // Get current usage stats
            const currentStats = await getUsageStats(userId);
            
            // Get warnings
            const warnings = await checkWarningThresholds(userId, userTier);

            const analytics = {
                period: `${period} days`,
                current_date: currentStats.date,
                daily_cost: currentStats.daily_cost,
                daily_cost_limit: require('../middleware/aiRateLimit').DAILY_COST_LIMITS[userTier],
                usage_by_service: currentStats.usage_by_service,
                user_tier: userTier,
                warnings: warnings,
                // Mock additional analytics
                total_requests: Object.values(currentStats.usage_by_service).reduce((sum, count) => sum + count, 0),
                successful_requests: Math.floor(Object.values(currentStats.usage_by_service).reduce((sum, count) => sum + count, 0) * 0.95),
                services_used: {
                    description_generation: currentStats.usage_by_service.description_generation || 0,
                    image_generation: currentStats.usage_by_service.image_generation || 0,
                    crop_analysis: currentStats.usage_by_service.crop_analysis || 0,
                    marketing_copy: currentStats.usage_by_service.marketing_copy || 0
                },
                upgrade_benefits: userTier === 'free' ? {
                    basic: "2x request limits, $10 daily budget",
                    premium: "5x request limits, $50 daily budget", 
                    enterprise: "10x request limits, $200 daily budget"
                } : undefined
            };

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error in analytics endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch analytics'
            });
        }
    }
);

// Get AI recommendations for user
router.get('/recommendations',
    verifyToken,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { type, limit = 10 } = req.query;

            // This would fetch from ai_recommendations table
            const mockRecommendations = [
                {
                    id: '1',
                    type: 'pricing',
                    title: 'Optimize your tomato pricing',
                    description: 'Based on market analysis, consider increasing your tomato prices by 8% to match market trends.',
                    priority: 'high',
                    action_required: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    type: 'marketing',
                    title: 'Seasonal marketing opportunity',
                    description: 'Peak season approaching for your crops. Consider updating product descriptions.',
                    priority: 'medium',
                    action_required: false,
                    created_at: new Date().toISOString()
                }
            ];

            res.json({
                success: true,
                data: type ? mockRecommendations.filter(r => r.type === type) : mockRecommendations
            });

        } catch (error) {
            logger.error('Error in recommendations endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recommendations'
            });
        }
    }
);

// Mark recommendation as read
router.patch('/recommendations/:id/read',
    verifyToken,
    async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // This would update the recommendation in the database
            // For now, just return success

            res.json({
                success: true,
                message: 'Recommendation marked as read'
            });

        } catch (error) {
            logger.error('Error marking recommendation as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update recommendation'
            });
        }
    }
);

module.exports = router;
