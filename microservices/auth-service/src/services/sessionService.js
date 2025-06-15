const { getPool } = require('../config/database');
const logger = require('../utils/logger');

class SessionService {
  // Create new session
  async create(sessionData) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const { userId, tokenHash, refreshTokenHash, ipAddress, userAgent } = sessionData;
      
      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const query = `
        INSERT INTO sessions (user_id, token_hash, refresh_token_hash, expires_at, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, expires_at, created_at
      `;

      const values = [userId, tokenHash, refreshTokenHash, expiresAt, ipAddress, userAgent];
      const result = await client.query(query, values);

      logger.info(`Session created for user: ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find session by user ID
  async findByUserId(userId) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, user_id, token_hash, refresh_token_hash, expires_at, 
               created_at, last_used, ip_address, user_agent
        FROM sessions 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await client.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding session by user ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find session by ID
  async findById(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, user_id, token_hash, refresh_token_hash, expires_at, 
               created_at, last_used, ip_address, user_agent
        FROM sessions 
        WHERE id = $1
      `;

      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding session by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update session token
  async updateToken(sessionId, newTokenHash) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE sessions 
        SET token_hash = $1, last_used = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, user_id, expires_at
      `;

      const result = await client.query(query, [newTokenHash, sessionId]);

      if (result.rows.length === 0) {
        throw new Error('Session not found');
      }

      logger.info(`Session token updated: ${sessionId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating session token:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update last used timestamp
  async updateLastUsed(sessionId) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE sessions 
        SET last_used = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      await client.query(query, [sessionId]);
    } catch (error) {
      logger.error('Error updating session last used:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete session by ID
  async deleteById(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        DELETE FROM sessions 
        WHERE id = $1
        RETURNING id, user_id
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length > 0) {
        logger.info(`Session deleted: ${id}`);
        return result.rows[0];
      }

      return null;
    } catch (error) {
      logger.error('Error deleting session:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete all sessions for a user
  async deleteByUserId(userId) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        DELETE FROM sessions 
        WHERE user_id = $1
        RETURNING id
      `;

      const result = await client.query(query, [userId]);
      
      logger.info(`${result.rows.length} session(s) deleted for user: ${userId}`);
      return result.rows.length;
    } catch (error) {
      logger.error('Error deleting sessions by user ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        DELETE FROM sessions 
        WHERE expires_at <= CURRENT_TIMESTAMP
        RETURNING id
      `;

      const result = await client.query(query);
      
      if (result.rows.length > 0) {
        logger.info(`Cleaned up ${result.rows.length} expired session(s)`);
      }

      return result.rows.length;
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get active sessions for a user
  async getActiveSessionsForUser(userId) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, expires_at, created_at, last_used, ip_address, user_agent
        FROM sessions 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY last_used DESC
      `;

      const result = await client.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting active sessions for user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get session statistics
  async getStats() {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(*) FILTER (WHERE expires_at > CURRENT_TIMESTAMP) as active_sessions,
          COUNT(*) FILTER (WHERE expires_at <= CURRENT_TIMESTAMP) as expired_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as sessions_today,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as sessions_last_7_days
        FROM sessions
      `;

      const result = await client.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting session stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Extend session expiration
  async extendExpiration(sessionId, hoursToAdd = 24) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE sessions 
        SET expires_at = expires_at + INTERVAL '${hoursToAdd} hours'
        WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
        RETURNING id, expires_at
      `;

      const result = await client.query(query, [sessionId]);

      if (result.rows.length === 0) {
        throw new Error('Session not found or already expired');
      }

      logger.info(`Session expiration extended: ${sessionId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error extending session expiration:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new SessionService();
