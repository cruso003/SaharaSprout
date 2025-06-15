const { getPool } = require('../config/database');
const logger = require('../utils/logger');

class UserService {
  // Create new user
  async create(userData) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const { email, passwordHash, role, profileData } = userData;

      const query = `
        INSERT INTO users (email, password_hash, role, profile_data)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, role, profile_data, email_verified, is_active, created_at, updated_at
      `;

      const values = [email, passwordHash, role, profileData];
      const result = await client.query(query, values);

      logger.info(`User created: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by email
  async findByEmail(email) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, email, password_hash, role, profile_data, email_verified, 
               is_active, last_login, created_at, updated_at
        FROM users 
        WHERE email = $1
      `;

      const result = await client.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by ID
  async findById(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, email, password_hash, role, profile_data, email_verified, 
               is_active, last_login, created_at, updated_at
        FROM users 
        WHERE id = $1
      `;

      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update user
  async update(id, updates) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (key === 'profileData') {
          setClause.push(`profile_data = $${paramIndex}`);
          values.push(updates[key]);
        } else {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
        }
        paramIndex++;
      });

      values.push(id); // Add ID as last parameter

      const query = `
        UPDATE users 
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id, email, role, profile_data, email_verified, is_active, updated_at
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info(`User updated: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update last login timestamp
  async updateLastLogin(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      await client.query(query, [id]);
      logger.info(`Last login updated for user: ${id}`);
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Deactivate user
  async deactivate(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, email, is_active
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info(`User deactivated: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Activate user
  async activate(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, email, is_active
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info(`User activated: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error activating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Verify email
  async verifyEmail(id) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        UPDATE users 
        SET email_verified = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, email, email_verified
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info(`Email verified for user: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user statistics
  async getStats() {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'buyer') as buyers,
          COUNT(*) FILTER (WHERE role = 'farmer') as farmers,
          COUNT(*) FILTER (WHERE role = 'admin') as admins,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_last_30_days
        FROM users
      `;

      const result = await client.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // List users with pagination
  async list(page = 1, limit = 20, filters = {}) {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const values = [];
      let paramIndex = 1;

      // Add filters
      if (filters.role) {
        whereClause += ` AND role = $${paramIndex}`;
        values.push(filters.role);
        paramIndex++;
      }

      if (filters.isActive !== undefined) {
        whereClause += ` AND is_active = $${paramIndex}`;
        values.push(filters.isActive);
        paramIndex++;
      }

      if (filters.emailVerified !== undefined) {
        whereClause += ` AND email_verified = $${paramIndex}`;
        values.push(filters.emailVerified);
        paramIndex++;
      }

      const query = `
        SELECT id, email, role, profile_data, email_verified, is_active, 
               last_login, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      values.push(limit, offset);

      const result = await client.query(query, values);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users 
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, values.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      return {
        users: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing users:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new UserService();
