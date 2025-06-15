const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'saharasprout_products',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
const connectDB = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        logger.info('Database connection established:', result.rows[0]);
        client.release();
        return true;
    } catch (error) {
        logger.error('Database connection failed:', error.message);
        throw error;
    }
};

// Health check query
const healthCheck = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT 1 as status');
        client.release();
        return result.rows[0].status === 1;
    } catch (error) {
        logger.error('Database health check failed:', error.message);
        return false;
    }
};

// Graceful shutdown
const closeDB = async () => {
    try {
        await pool.end();
        logger.info('Database connection pool closed');
    } catch (error) {
        logger.error('Error closing database connection:', error.message);
    }
};

module.exports = {
    pool,
    connectDB,
    healthCheck,
    closeDB
};
