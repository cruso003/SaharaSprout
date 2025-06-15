const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const userService = require('../services/userService');
const sessionService = require('../services/sessionService');
const { setCache, deleteCache } = require('../config/redis');

// Generate JWT tokens helper function
const generateTokens = async (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, role = 'buyer' } = req.body;

      // Check if user already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        email,
        passwordHash,
        role,
        profileData: {
          name,
          joinedDate: new Date().toISOString().split('T')[0]
        }
      };

      const user = await userService.create(userData);

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user);

      // Create session
      await sessionService.create({
        userId: user.id,
        tokenHash: await bcrypt.hash(accessToken, 10),
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info(`User registered successfully: ${user.id}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profileData: user.profile_data
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password, role } = req.body;

      // Find user by email
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Validate password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check role if specified
      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Expected role: ${role}`
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user);

      // Create session
      await sessionService.create({
        userId: user.id,
        tokenHash: await bcrypt.hash(accessToken, 10),
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Update last login
      await userService.updateLastLogin(user.id);

      logger.info(`User logged in successfully: ${user.id}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profileData: user.profile_data
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Refresh access token
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Find user
      const user = await userService.findById(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Verify session exists
      const session = await sessionService.findByUserId(user.id);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Update session
      await sessionService.updateToken(session.id, await bcrypt.hash(accessToken, 10));

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh'
      });
    }
  }

  // User logout
  async logout(req, res) {
    try {
      const userId = req.user.userId;

      // Delete all sessions for user
      await sessionService.deleteByUserId(userId);

      // Clear cached user data
      await deleteCache(`user:${userId}`);

      logger.info(`User logged out successfully: ${userId}`);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profileData: user.profile_data,
            emailVerified: user.email_verified,
            lastLogin: user.last_login,
            createdAt: user.created_at
          }
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updates = req.body;

      // Don't allow updating sensitive fields
      const allowedUpdates = ['profileData'];
      const filteredUpdates = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const updatedUser = await userService.update(userId, filteredUpdates);

      // Clear cached user data
      await deleteCache(`user:${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            profileData: updatedUser.profile_data
          }
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify token (for other services)
  async verifyToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token required'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists and is active
      const user = await userService.findById(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      logger.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();
