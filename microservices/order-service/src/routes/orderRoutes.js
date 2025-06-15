const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    createOrder,
    getOrder,
    getUserOrders,
    getFarmOrders,
    updateOrderStatus,
    addDeliveryTracking
} = require('../controllers/orderController');

// All order routes require authentication
router.use(authenticateToken);

// Create new order
router.post('/', createOrder);

// Get user's orders (multiple routes for compatibility)
router.get('/', getUserOrders);
router.get('/my-orders', getUserOrders);

// Get specific order
router.get('/:orderId', getOrder);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

// Add delivery tracking
router.post('/:orderId/tracking', addDeliveryTracking);

// Get farm orders (for farmers)
router.get('/farm/:farmId', getFarmOrders);

module.exports = router;
