const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    addToCart,
    updateCartItem,
    removeFromCart,
    getCart,
    clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/items', addToCart);

// Update cart item quantity
router.put('/items/:productId', updateCartItem);

// Remove item from cart
router.delete('/items/:productId', removeFromCart);

// Clear cart
router.delete('/', clearCart);

module.exports = router;
