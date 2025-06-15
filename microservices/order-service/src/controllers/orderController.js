const Order = require('../models/Order');
const { body, param, query: queryValidator, validationResult } = require('express-validator');
const axios = require('axios');

// Validation middleware
const validateCreateOrder = [
    body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
    body('items.*.productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
    body('deliveryAddress').optional().isObject(),
    body('deliveryMethod').optional().isIn(['pickup', 'delivery']),
    body('notes').optional().isString().isLength({ max: 1000 })
];

const validateOrderId = [
    param('orderId').isUUID().withMessage('Order ID must be a valid UUID')
];

const validateStatus = [
    body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid status'),
    body('notes').optional().isString().isLength({ max: 500 })
];

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

// Get AI recommendations for order optimization
async function getAIRecommendations(orderData) {
    try {
        // Mock AI recommendations for now
        // In production, this would call the AI service
        return {
            deliveryOptimization: {
                suggestedMethod: orderData.deliveryMethod || 'pickup',
                estimatedCost: 500, // XOF
                estimatedTime: '2-3 days'
            },
            productRecommendations: [
                'Consider adding seasonal vegetables',
                'Bulk discount available for orders over 5000 XOF'
            ],
            farmRecommendations: {
                farmScore: 4.5,
                deliveryReliability: 95,
                productQuality: 4.8
            }
        };
    } catch (error) {
        console.error('AI recommendations error:', error);
        return null;
    }
}

// Get product information from product service
async function getProductInfo(productIds) {
    try {
        const productData = {};
        for (const productId of productIds) {
            // Mock product data for now
            productData[productId] = {
                id: productId,
                name: 'Fresh Produce',
                price: 2500,
                currency: 'XOF',
                farmId: '123e4567-e89b-12d3-a456-426614174000',
                inStock: true
            };
        }
        return productData;
    } catch (error) {
        console.error('Product service error:', error);
        return {};
    }
}

// Create new order
const createOrder = [
    validateCreateOrder,
    checkValidation,
    async (req, res, next) => {
        try {
            const { items, deliveryAddress, deliveryMethod, notes } = req.body;
            const userId = req.user.id;

            // Get product information
            const productIds = items.map(item => item.productId);
            const productData = await getProductInfo(productIds);

            // Validate products exist and are available
            const enhancedItems = items.map(item => {
                const product = productData[item.productId];
                if (!product || !product.inStock) {
                    throw new Error(`Product ${item.productId} is not available`);
                }
                
                return {
                    ...item,
                    productSnapshot: product
                };
            });

            // Get AI recommendations
            const aiRecommendations = await getAIRecommendations({
                items: enhancedItems,
                deliveryMethod,
                userId
            });

            // Create order
            const orderData = {
                userId,
                farmId: productData[productIds[0]]?.farmId, // Use first product's farm
                items: enhancedItems,
                deliveryAddress,
                deliveryMethod,
                notes,
                aiRecommendations
            };

            const order = await Order.create(orderData);

            res.status(201).json({
                success: true,
                data: {
                    order,
                    aiRecommendations
                },
                message: 'Order created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get order by ID
const getOrder = [
    validateOrderId,
    checkValidation,
    async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Order not found',
                        status: 404
                    }
                });
            }

            // Check if user has access to this order
            if (order.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied',
                        status: 403
                    }
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get user's orders
const getUserOrders = [
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
    queryValidator('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    checkValidation,
    async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { limit = 20, offset = 0, status } = req.query;

            const orders = await Order.findByUserId(userId, {
                limit: parseInt(limit),
                offset: parseInt(offset),
                status
            });

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        count: orders.length
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get farm's orders (for farmers)
const getFarmOrders = [
    param('farmId').isUUID().withMessage('Farm ID must be a valid UUID'),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
    queryValidator('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    checkValidation,
    async (req, res, next) => {
        try {
            const { farmId } = req.params;
            const { limit = 20, offset = 0, status } = req.query;

            // Check if user has access to this farm
            if (req.user.farmId !== farmId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied to farm orders',
                        status: 403
                    }
                });
            }

            const orders = await Order.findByFarmId(farmId, {
                limit: parseInt(limit),
                offset: parseInt(offset),
                status
            });

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        count: orders.length
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
];

// Update order status
const updateOrderStatus = [
    validateOrderId,
    validateStatus,
    checkValidation,
    async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const { status, notes } = req.body;
            const changedBy = req.user.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Order not found',
                        status: 404
                    }
                });
            }

            // Check permissions
            if (req.user.role !== 'admin' && order.farm_id !== req.user.farmId) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied',
                        status: 403
                    }
                });
            }

            const updatedOrder = await Order.updateStatus(orderId, status, notes, changedBy);

            res.json({
                success: true,
                data: updatedOrder,
                message: `Order status updated to ${status}`
            });
        } catch (error) {
            next(error);
        }
    }
];

// Add delivery tracking
const addDeliveryTracking = [
    validateOrderId,
    body('status').isString().notEmpty(),
    body('location').optional().isString(),
    body('coordinates').optional().isObject(),
    body('estimatedArrival').optional().isISO8601(),
    body('notes').optional().isString(),
    checkValidation,
    async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const trackingData = req.body;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Order not found',
                        status: 404
                    }
                });
            }

            // Check permissions
            if (req.user.role !== 'admin' && order.farm_id !== req.user.farmId) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied',
                        status: 403
                    }
                });
            }

            const tracking = await Order.addDeliveryTracking(orderId, trackingData);

            res.status(201).json({
                success: true,
                data: tracking,
                message: 'Delivery tracking added successfully'
            });
        } catch (error) {
            next(error);
        }
    }
];

module.exports = {
    createOrder,
    getOrder,
    getUserOrders,
    getFarmOrders,
    updateOrderStatus,
    addDeliveryTracking
};
