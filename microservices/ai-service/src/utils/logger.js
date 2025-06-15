const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.LOG_LEVEL || 'debug'
        })
    );
}

// File transports
transports.push(
    // Error log file
    new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: format,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
    }),
    
    // Combined log file
    new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: format,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
    }),

    // AI operations log file
    new DailyRotateFile({
        filename: path.join(logDir, 'ai-operations-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: format,
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true,
        level: 'info'
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Add AI-specific logging methods
logger.logAIOperation = (operation, data, duration) => {
    logger.info(`AI Operation: ${operation}`, {
        operation,
        duration: duration ? `${duration}ms` : undefined,
        ...data,
        timestamp: new Date().toISOString()
    });
};

logger.logMarketAnalysis = (analysis, duration) => {
    logger.info('Market Analysis Completed', {
        operation: 'market_analysis',
        duration: duration ? `${duration}ms` : undefined,
        products_analyzed: analysis.products_count,
        insights_generated: analysis.insights_count,
        timestamp: new Date().toISOString()
    });
};

logger.logImageGeneration = (request, result, duration) => {
    logger.info('AI Image Generation', {
        operation: 'image_generation',
        prompt: request.prompt,
        style: request.style,
        success: result.success,
        image_url: result.image_url,
        duration: duration ? `${duration}ms` : undefined,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
