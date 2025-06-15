const express = require('express');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { authSchemas } = require('../utils/validationSchemas');

const router = express.Router();

// Public routes
router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/refresh', validateRequest(authSchemas.refresh), authController.refresh);
router.post('/verify-token', validateRequest(authSchemas.verifyToken), authController.verifyToken);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateRequest(authSchemas.updateProfile), authController.updateProfile);

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
