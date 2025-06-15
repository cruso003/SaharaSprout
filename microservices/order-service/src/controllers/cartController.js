const Cart = require('../models/Cart');
const { body, param, validationResult } = require('express-validator');

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

// Add item to cart
const addToCart = [
    body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    checkValidation,
    async (req, res, next) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.id;

            // TODO: Validate product exists and is available
            // This would call the product service to verify product details

            const cartItem = await Cart.addItem(userId, productId, quantity);

            res.status(201).json({
                success: true,
                data: cartItem,
                message: 'Item added to cart successfully'
            });
        } catch (error) {
            next(error);
        }
    }
];

// Update cart item quantity
const updateCartItem = [
    param('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    checkValidation,
    async (req, res, next) => {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;
            const userId = req.user.id;

            const cartItem = await Cart.updateItem(userId, productId, quantity);

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Cart item not found',
                        status: 404
                    }
                });
            }

            res.json({
                success: true,
                data: cartItem,
                message: 'Cart item updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
];

// Remove item from cart
const removeFromCart = [
    param('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    checkValidation,
    async (req, res, next) => {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            const removedItem = await Cart.removeItem(userId, productId);

            if (!removedItem) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Cart item not found',
                        status: 404
                    }
                });
            }

            res.json({
                success: true,
                data: removedItem,
                message: 'Item removed from cart successfully'
            });
        } catch (error) {
            next(error);
        }
    }
];

// Get user's cart
const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.getCartSummary(userId);

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// Clear user's cart
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const deletedCount = await Cart.clearUserCart(userId);

        res.json({
            success: true,
            data: {
                deletedCount
            },
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToCart,
    updateCartItem,
    removeFromCart,
    getCart,
    clearCart
};
