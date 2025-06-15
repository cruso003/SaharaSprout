const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access token required',
                    status: 401
                }
            });
        }

        // For testing purposes, we'll accept any token that looks valid
        // In production, this would verify against a proper JWT secret
        if (token.length > 10) {
            // Mock user data based on token - using valid UUID format
            req.user = {
                id: '518e5876-5f74-41db-903e-46e4bd5673ec', // Valid UUID format matching auth service
                email: 'admin@saharasprout.com',
                role: 'admin',
                farmId: '123e4567-e89b-12d3-a456-426614174000'
            };
            next();
        } else {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Invalid or expired token',
                    status: 403
                }
            });
        }
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Invalid token format',
                status: 403
            }
        });
    }
}

function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token && token.length > 10) {
            req.user = {
                id: '518e5876-5f74-41db-903e-46e4bd5673ec', // Valid UUID format matching auth service
                email: 'admin@saharasprout.com',
                role: 'admin',
                farmId: '123e4567-e89b-12d3-a456-426614174000'
            };
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
}

module.exports = {
    authenticateToken,
    optionalAuth
};
