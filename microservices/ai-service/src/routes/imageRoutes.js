const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { verifyToken, requireFarmer, optionalAuth } = require('../middleware/auth');
const { generateProductImage, analyzeCropImage } = require('../services/aiService');
const { cache } = require('../config/redis');
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

// Generate product image with AI
router.post('/generate',
    verifyToken,
    requireFarmer,
    [
        body('productName').notEmpty().withMessage('Product name is required'),
        body('category').notEmpty().withMessage('Product category is required'),
        body('style').optional().isIn(['professional', 'rustic', 'modern', 'natural', 'minimalist']),
        body('background').optional().isString(),
        body('additionalPrompt').optional().isString()
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

            const imageRequest = {
                ...req.body,
                userId: req.user.id
            };

            const result = await generateProductImage(imageRequest);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Product image generated successfully',
                    data: {
                        image_url: result.image_url,
                        style: result.style,
                        processing_time: result.processing_time,
                        generated_at: result.generated_at
                    }
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

// Upload and analyze crop image
router.post('/analyze',
    verifyToken,
    requireFarmer,
    upload.single('image'),
    [
        body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
        body('analysisType').optional().isIn(['health', 'quality', 'pest', 'disease', 'maturity', 'general']),
        body('cropType').optional().isString(),
        body('location').optional().isString()
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

            // If image file is uploaded, upload it to Cloudinary
            if (req.file && !imageUrl) {
                try {
                    // Convert buffer to base64
                    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                    
                    const uploadResult = await cloudinary.uploader.upload(base64Image, {
                        folder: 'saharasprout/crop-analysis',
                        public_id: `crop_${req.user.id}_${Date.now()}`,
                        transformation: [
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' }
                        ]
                    });
                    
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    logger.error('Error uploading image to Cloudinary:', uploadError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image'
                    });
                }
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
                data: {
                    image_url: imageUrl,
                    analysis: result,
                    metadata: {
                        crop_type: req.body.cropType,
                        location: req.body.location,
                        analyzed_by: req.user.id,
                        analyzed_at: new Date().toISOString()
                    }
                }
            });

        } catch (error) {
            logger.error('Error in analyze image endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze crop image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Get stock photos for product category
router.get('/stock/:category',
    optionalAuth,
    async (req, res) => {
        try {
            const { category } = req.params;
            const { count = 12, quality = 'regular' } = req.query;

            const cacheKey = `stock_photos:${category}:${count}:${quality}`;
            let photos = await cache.getAIContent(cacheKey);

            if (!photos) {
                // Fetch from Unsplash API
                try {
                    const unsplashResponse = await axios.get('https://api.unsplash.com/search/photos', {
                        params: {
                            query: `${category} agriculture food fresh`,
                            per_page: Math.min(parseInt(count), 30),
                            order_by: 'relevant',
                            orientation: 'landscape'
                        },
                        headers: {
                            'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                        }
                    });

                    photos = unsplashResponse.data.results.map(photo => ({
                        id: photo.id,
                        url: quality === 'high' ? photo.urls.full : photo.urls.regular,
                        thumb: photo.urls.thumb,
                        alt: photo.alt_description || `${category} agriculture`,
                        credit: {
                            photographer: photo.user.name,
                            profile: photo.user.links.html
                        },
                        download_url: photo.links.download,
                        dimensions: {
                            width: photo.width,
                            height: photo.height
                        }
                    }));

                    // Cache for 24 hours
                    await cache.setAIContent(cacheKey, photos, 86400);

                } catch (unsplashError) {
                    logger.error('Error fetching from Unsplash:', unsplashError);
                    
                    // Return placeholder data
                    photos = Array.from({ length: parseInt(count) }, (_, i) => ({
                        id: `placeholder_${i}`,
                        url: `https://picsum.photos/800/600?random=${i}`,
                        thumb: `https://picsum.photos/200/150?random=${i}`,
                        alt: `${category} placeholder image`,
                        credit: { photographer: 'Placeholder', profile: '#' }
                    }));
                }
            }

            res.json({
                success: true,
                data: {
                    category,
                    count: photos.length,
                    photos
                }
            });

        } catch (error) {
            logger.error('Error in stock photos endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch stock photos'
            });
        }
    }
);

// Get image optimization suggestions
router.post('/optimize',
    verifyToken,
    [
        body('imageUrl').isURL().withMessage('Valid image URL is required'),
        body('targetUse').optional().isIn(['product_listing', 'social_media', 'print', 'web'])
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

            const { imageUrl, targetUse = 'product_listing' } = req.body;

            // Analyze image and provide optimization suggestions
            const suggestions = {
                current_image: imageUrl,
                target_use: targetUse,
                recommendations: [],
                optimized_versions: {}
            };

            // Based on target use, provide different optimization suggestions
            switch (targetUse) {
                case 'product_listing':
                    suggestions.recommendations = [
                        'Use square aspect ratio (1:1) for better mobile display',
                        'Ensure high contrast and clear product visibility',
                        'Add white or neutral background for professional look',
                        'Optimize for fast loading (WebP format recommended)'
                    ];
                    suggestions.optimized_versions = {
                        thumbnail: `${imageUrl}?w=200&h=200&fit=crop&crop=center`,
                        medium: `${imageUrl}?w=500&h=500&fit=crop&crop=center`,
                        large: `${imageUrl}?w=1000&h=1000&fit=crop&crop=center`
                    };
                    break;

                case 'social_media':
                    suggestions.recommendations = [
                        'Use 1:1 aspect ratio for Instagram posts',
                        'Add vibrant colors to catch attention',
                        'Include lifestyle context or people using the product',
                        'Ensure text overlay readability'
                    ];
                    suggestions.optimized_versions = {
                        instagram_post: `${imageUrl}?w=1080&h=1080&fit=crop&crop=center`,
                        facebook_post: `${imageUrl}?w=1200&h=630&fit=crop&crop=center`,
                        twitter_card: `${imageUrl}?w=1200&h=675&fit=crop&crop=center`
                    };
                    break;

                case 'print':
                    suggestions.recommendations = [
                        'Use high resolution (300 DPI minimum)',
                        'CMYK color profile for printing',
                        'Include bleed area for professional printing',
                        'Avoid pure black or white for better print quality'
                    ];
                    break;

                default:
                    suggestions.recommendations = [
                        'Optimize file size for web use',
                        'Use appropriate aspect ratio',
                        'Ensure good lighting and composition'
                    ];
            }

            res.json({
                success: true,
                message: 'Image optimization suggestions generated',
                data: suggestions
            });

        } catch (error) {
            logger.error('Error in optimize image endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate optimization suggestions'
            });
        }
    }
);

// Get user's image analysis history
router.get('/history',
    verifyToken,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 20, type } = req.query;

            // This would fetch from image_analysis table
            const mockHistory = [
                {
                    id: '1',
                    image_url: 'https://example.com/crop1.jpg',
                    analysis_type: 'health',
                    results: {
                        health_status: 'good',
                        confidence: 0.92,
                        issues: []
                    },
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    image_url: 'https://example.com/crop2.jpg',
                    analysis_type: 'pest',
                    results: {
                        pests_detected: ['aphids'],
                        severity: 'low',
                        confidence: 0.78
                    },
                    created_at: new Date(Date.now() - 86400000).toISOString()
                }
            ];

            const filteredHistory = type 
                ? mockHistory.filter(item => item.analysis_type === type)
                : mockHistory;

            res.json({
                success: true,
                data: {
                    total: filteredHistory.length,
                    items: filteredHistory.slice(0, parseInt(limit))
                }
            });

        } catch (error) {
            logger.error('Error in image history endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch image analysis history'
            });
        }
    }
);

module.exports = router;
