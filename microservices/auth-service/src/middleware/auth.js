const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const userService = require('../services/userService');
const { getCache, setCache } = require('../config/redis');

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check cache first for better performance
    let user = await getCache(`user:${decoded.userId}`);
    
    if (!user) {
      // If not in cache, fetch from database
      user = await userService.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Cache user data for 5 minutes
      await setCache(`user:${decoded.userId}`, {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.is_active
      }, 300);
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired'
      });
    }

    logger.error('Token authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

// Middleware to authorize based on user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt: User ${req.user.userId} with role ${req.user.role} tried to access ${req.path}`);
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
const authorizeOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const resourceUserId = req.params[userIdParam];
    
    // Allow if user is admin or owns the resource
    if (req.user.role === 'admin' || req.user.userId === resourceUserId) {
      next();
    } else {
      logger.warn(`Ownership violation: User ${req.user.userId} tried to access resource owned by ${resourceUserId}`);
      
      res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnership
};
