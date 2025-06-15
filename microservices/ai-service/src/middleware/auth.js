const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required for AI services'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            } else {
                throw error;
            }
        }

    } catch (error) {
        logger.error('AI Service auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for AI services'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `AI service access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Check if user is farmer (primary AI service users)
const requireFarmer = requireRole(['farmer', 'admin']);

// Check if user is admin
const requireAdmin = requireRole('admin');

// Optional authentication (sets req.user if token is valid, but doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (error) {
                // Token is invalid, but we don't fail here for optional auth
                logger.warn('Invalid token in AI service optional auth:', error.message);
            }
        }

        next();
    } catch (error) {
        logger.error('AI service optional auth middleware error:', error);
        next(); // Continue without authentication
    }
};

module.exports = {
    verifyToken,
    requireRole,
    requireFarmer,
    requireAdmin,
    optionalAuth
};
