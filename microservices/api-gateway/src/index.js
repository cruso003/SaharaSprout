const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const logger = require('./utils/logger');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3009;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',  // SaharaMarket frontend
    'http://localhost:3001',  // Alternative frontend port
    'http://localhost:3002'   // Dashboard frontend
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// Service endpoints configuration
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3010',
    path: '/api/auth'
  },
  products: {
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3011',
    path: '/api/products'
  },
  orders: {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3012',
    path: '/api/orders'
  },
  cart: {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3012',
    path: '/api/cart'
  },
  payments: {
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3013',
    path: '/api/payments'
  },
  communication: {
    target: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3014',
    path: '/api/communication'
  },
  iot: {
    target: process.env.IOT_SERVICE_URL || 'http://localhost:3015',
    path: '/api/iot'
  },
  ai: {
    target: process.env.AI_SERVICE_URL || 'http://localhost:3016',
    path: '/api/ai'
  }
};

// Create proxy middleware for each service
Object.entries(services).forEach(([serviceName, config]) => {
  const proxyOptions = {
    target: config.target,
    changeOrigin: true,
    pathRewrite: serviceName === 'ai' ? {
      '^/api/ai/health': '/health', // Health endpoint goes to /health
      '^/api/ai': '/api' // Other AI endpoints preserve /api prefix
    } : (serviceName === 'products') ? {
      '^/api/products/health': '/health', // Health endpoint goes to /health
      // No rewriting needed for products and categories - they already have /api prefix
    } : {
      [`^${config.path}`]: '' // Remove the service prefix for other services
    },
    timeout: 10000, // 10 second timeout
    proxyTimeout: 10000,
    followRedirects: false,
    secure: false,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, {
        error: err.message,
        code: err.code,
        target: config.target,
        path: req.originalUrl,
        method: req.method
      });
      
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: `Service ${serviceName} is unavailable`,
          service: serviceName,
          error: err.message
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.originalUrl} to ${serviceName} at ${config.target}`);
      
      // Set headers
      proxyReq.setHeader('X-Gateway-Service', serviceName);
      proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || `req-${Date.now()}`);
      
      // Fix content-length for body requests
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Response from ${serviceName}: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
    }
  };

  // Use the full path pattern for matching
  app.use(config.path, createProxyMiddleware(proxyOptions));
});

// Separate proxy for categories (same target as products service)
const categoriesProxyOptions = {
  target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3011',
  changeOrigin: true,
  pathRewrite: {
    '^/api/categories/health': '/health', // Health endpoint goes to /health
    // No rewriting needed for categories - they already have /api prefix
  },
  timeout: 10000,
  proxyTimeout: 10000,
  followRedirects: false,
  secure: false,
  onError: (err, req, res) => {
    logger.error(`Proxy error for categories:`, {
      error: err.message,
      code: err.code,
      target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3011',
      path: req.originalUrl,
      method: req.method
    });
    
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: `Service categories is unavailable`,
        service: 'categories',
        error: err.message
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying ${req.method} ${req.originalUrl} to categories at ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3011'}`);
    
    // Set headers
    proxyReq.setHeader('X-Gateway-Service', 'categories');
    proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || `req-${Date.now()}`);
    
    // Fix content-length for body requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Response from categories: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
};

app.use('/api/categories', createProxyMiddleware(categoriesProxyOptions));

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'SaharaSprout API Gateway',
    version: '1.0.0',
    description: 'Gateway for SaharaSprout microservices ecosystem',
    services: [...Object.keys(services), 'categories'],
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      products: '/api/products/*',
      categories: '/api/categories/*',
      orders: '/api/orders/*',
      payments: '/api/payments/*',
      communication: '/api/communication/*',
      iot: '/api/iot/*',
      ai: '/api/ai/*'
    },
    documentation: 'https://docs.saharasprout.com'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: ['/health', '/api', ...Object.values(services).map(s => s.path)]
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = () => {
  try {
    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API docs: http://localhost:${PORT}/api`);
      logger.info('Available services:', Object.keys(services));
    });
  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = app;
