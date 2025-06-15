const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeAI } = require('./services/aiService');
const { initializeMarketService, startMarketAnalysis } = require('./services/marketIntelligence');
const cacheCleanup = require('./utils/cacheCleanup');

// Route imports
const aiRoutes = require('./routes/aiRoutes');
const marketRoutes = require('./routes/marketRoutes');
const imageRoutes = require('./routes/imageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const healthRoutes = require('./routes/healthRoutes');
const cacheRoutes = require('./routes/cache');

// New comprehensive route modules based on Features.md
const irrigationRoutes = require('./routes/irrigationRoutes');
const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const farmRoutes = require('./routes/farmRoutes');
const languageRoutes = require('./routes/languageRoutes');
const dataIngestionRoutes = require('./routes/dataIngestionRoutes');

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3016;

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000', // SaharaMarket frontend
        'http://localhost:3001', // SaharaFarm frontend
        'http://localhost:3009', // API Gateway
        'http://localhost:3010', // Auth Service
        'http://localhost:3011', // Product Service
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-service-token']
}));

// Rate limiting (more restrictive for AI endpoints due to computational cost)
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50, // 50 requests per window
    message: {
        error: 'Too many AI requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health' || req.path === '/health/ready'
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});

// Health check routes (no authentication required)
app.use('/health', healthRoutes);

// API routes
app.use('/api/ai', aiRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cache', cacheRoutes);

// New comprehensive agricultural AI routes
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/language', languageRoutes);

// ESP32 data ingestion routes (separate for device authentication)
app.use('/api/data', dataIngestionRoutes);

// Service info endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'SaharaSprout AI Service',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        capabilities: [
            'Market Intelligence & Price Analysis',
            'AI Product Photo Generation',
            'Quality Product Descriptions',
            'Crop Health Analysis',
            'Yield Predictions',
            'Smart Recommendations',
            'Weather-based Insights',
            'Automated Content Creation',
            'Irrigation Data Analysis',
            'Crop Lifecycle Management',
            'Weather Integration & Predictions',
            'Farm Financial Analytics',
            'Zone Performance Optimization',
            'Supply Chain Management',
            'Sustainability Assessment',
            'Pest & Disease Detection',
            'Harvest Timing Optimization',
            'Multi-language Support'
        ],
        endpoints: {
            health: '/health',
            ai: '/api/ai',
            market: '/api/market',
            images: '/api/images',
            analytics: '/api/analytics',
            cache: '/api/cache',
            irrigation: '/api/irrigation',
            crops: '/api/crops',
            weather: '/api/weather',
            farm: '/api/farm',
            language: '/api/language',
            data_ingestion: '/api/data'
        },
        esp32_endpoints: {
            irrigation_data: '/api/data/esp32/irrigation-data',
            npk_data: '/api/data/esp32/npk-data',
            water_flow: '/api/data/esp32/water-flow',
            batch_sync: '/api/data/esp32/batch-sync',
            heartbeat: '/api/data/esp32/heartbeat'
        }
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Schedule market analysis to run every hour
if (process.env.MARKET_ANALYSIS_INTERVAL) {
    cron.schedule('0 * * * *', async () => {
        logger.info('Running scheduled market analysis...');
        try {
            await startMarketAnalysis();
        } catch (error) {
            logger.error('Scheduled market analysis failed:', error);
        }
    });
}

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();
        logger.info('Database connected successfully');

        // Connect to Redis
        await connectRedis();
        logger.info('Redis connected successfully');

        // Initialize AI services
        await initializeAI();
        await initializeMarketService();
        logger.info('AI services initialized successfully');

        // Schedule cache cleanup every 6 hours
        cacheCleanup.scheduleCleanup(6);
        logger.info('Cache cleanup scheduled every 6 hours');

        // Market analysis is now on-demand only - no automatic startup analysis
        // This is appropriate for a SaaS platform where farmers can be anywhere in Africa
        logger.info('Market analysis configured for on-demand requests only');

        // Start the server
        app.listen(PORT, () => {
            logger.info(`AI Service running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`Service URL: http://localhost:${PORT}`);
        });

    } catch (error) {
        logger.error('Failed to start AI service:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
