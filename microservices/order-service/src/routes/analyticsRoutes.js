const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getOrderAnalytics,
    getDemandForecast,
    getSeasonalTrends,
    getFarmerAnalytics
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(authenticateToken);

// Get order analytics dashboard
router.get('/orders', getOrderAnalytics);

// Get demand forecasting
router.get('/demand-forecast', getDemandForecast);

// Get seasonal trends
router.get('/seasonal-trends', getSeasonalTrends);

// Get farmer performance analytics
router.get('/farmer', getFarmerAnalytics);

module.exports = router;
