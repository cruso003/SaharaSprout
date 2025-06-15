const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Category {
    // Create a new category
    static async create(categoryData) {
        const {
            name,
            description,
            slug,
            image_url,
            parent_id,
            is_active = true,
            sort_order = 0
        } = categoryData;

        const query = `
            INSERT INTO categories (name, description, slug, image_url, parent_id, is_active, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [name, description, slug, image_url, parent_id, is_active, sort_order];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating category:', error);
            throw error;
        }
    }

    // Find category by ID
    static async findById(id) {
        const query = `
            SELECT 
                c.*,
                parent.name as parent_name,
                parent.slug as parent_slug,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN categories parent ON c.parent_id = parent.id
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            WHERE c.id = $1
            GROUP BY c.id, parent.name, parent.slug
        `;

        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error finding category by ID:', error);
            throw error;
        }
    }

    // Find category by slug
    static async findBySlug(slug) {
        const query = `
            SELECT 
                c.*,
                parent.name as parent_name,
                parent.slug as parent_slug,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN categories parent ON c.parent_id = parent.id
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            WHERE c.slug = $1
            GROUP BY c.id, parent.name, parent.slug
        `;

        try {
            const result = await pool.query(query, [slug]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error finding category by slug:', error);
            throw error;
        }
    }

    // Find all categories with hierarchy
    static async findAll(options = {}) {
        const {
            parent_id,
            is_active = true,
            include_product_count = true
        } = options;

        let query = `
            SELECT 
                c.*,
                parent.name as parent_name,
                parent.slug as parent_slug
        `;

        if (include_product_count) {
            query += `, COUNT(p.id) as product_count`;
        }

        query += `
            FROM categories c
            LEFT JOIN categories parent ON c.parent_id = parent.id
        `;

        if (include_product_count) {
            query += `LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true`;
        }

        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (is_active !== undefined) {
            conditions.push(`c.is_active = $${paramIndex++}`);
            values.push(is_active);
        }

        if (parent_id !== undefined) {
            if (parent_id === null) {
                conditions.push(`c.parent_id IS NULL`);
            } else {
                conditions.push(`c.parent_id = $${paramIndex++}`);
                values.push(parent_id);
            }
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        if (include_product_count) {
            query += ` GROUP BY c.id, parent.name, parent.slug`;
        }

        query += ` ORDER BY c.sort_order ASC, c.name ASC`;

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            logger.error('Error finding categories:', error);
            throw error;
        }
    }

    // Get category hierarchy tree
    static async getHierarchy() {
        const query = `
            WITH RECURSIVE category_tree AS (
                -- Base case: root categories
                SELECT 
                    c.id,
                    c.name,
                    c.description,
                    c.slug,
                    c.image_url,
                    c.parent_id,
                    c.is_active,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    0 as level,
                    ARRAY[c.id] as path,
                    c.name::text as full_path
                FROM categories c 
                WHERE c.parent_id IS NULL AND c.is_active = true
                
                UNION ALL
                
                -- Recursive case: child categories
                SELECT 
                    c.id,
                    c.name,
                    c.description,
                    c.slug,
                    c.image_url,
                    c.parent_id,
                    c.is_active,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    ct.level + 1,
                    ct.path || c.id,
                    (ct.full_path || ' > ' || c.name)::text
                FROM categories c
                JOIN category_tree ct ON c.parent_id = ct.id
                WHERE c.is_active = true
            )
            SELECT 
                ct.*,
                COUNT(p.id) as product_count
            FROM category_tree ct
            LEFT JOIN products p ON ct.id = p.category_id AND p.is_active = true
            GROUP BY ct.id, ct.name, ct.description, ct.slug, ct.image_url, 
                     ct.parent_id, ct.is_active, ct.sort_order, ct.created_at, 
                     ct.updated_at, ct.level, ct.path, ct.full_path
            ORDER BY ct.level, ct.sort_order, ct.name
        `;

        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            logger.error('Error getting category hierarchy:', error);
            throw error;
        }
    }

    // Get subcategories of a category
    static async getSubcategories(parentId) {
        const query = `
            SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            WHERE c.parent_id = $1 AND c.is_active = true
            GROUP BY c.id
            ORDER BY c.sort_order ASC, c.name ASC
        `;

        try {
            const result = await pool.query(query, [parentId]);
            return result.rows;
        } catch (error) {
            logger.error('Error getting subcategories:', error);
            throw error;
        }
    }

    // Update category
    static async update(id, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        values.push(id);

        const query = `
            UPDATE categories 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${fields.length + 1}
            RETURNING *
        `;

        try {
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Category not found');
            }
            return result.rows[0];
        } catch (error) {
            logger.error('Error updating category:', error);
            throw error;
        }
    }

    // Delete category (soft delete)
    static async delete(id) {
        const query = `
            UPDATE categories 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;

        try {
            const result = await pool.query(query, [id]);
            return result.rows.length > 0;
        } catch (error) {
            logger.error('Error deleting category:', error);
            throw error;
        }
    }

    // Hard delete category
    static async hardDelete(id) {
        // First check if category has subcategories or products
        const checkQuery = `
            SELECT 
                (SELECT COUNT(*) FROM categories WHERE parent_id = $1) as subcategory_count,
                (SELECT COUNT(*) FROM products WHERE category_id = $1) as product_count
        `;

        const checkResult = await pool.query(checkQuery, [id]);
        const { subcategory_count, product_count } = checkResult.rows[0];

        if (subcategory_count > 0) {
            throw new Error('Cannot delete category with subcategories');
        }

        if (product_count > 0) {
            throw new Error('Cannot delete category with products');
        }

        const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows.length > 0;
        } catch (error) {
            logger.error('Error hard deleting category:', error);
            throw error;
        }
    }

    // Get category breadcrumbs
    static async getBreadcrumbs(categoryId) {
        const query = `
            WITH RECURSIVE breadcrumbs AS (
                SELECT id, name, slug, parent_id, 0 as level
                FROM categories 
                WHERE id = $1
                
                UNION ALL
                
                SELECT c.id, c.name, c.slug, c.parent_id, b.level + 1
                FROM categories c
                JOIN breadcrumbs b ON c.id = b.parent_id
            )
            SELECT id, name, slug
            FROM breadcrumbs
            ORDER BY level DESC
        `;

        try {
            const result = await pool.query(query, [categoryId]);
            return result.rows;
        } catch (error) {
            logger.error('Error getting category breadcrumbs:', error);
            throw error;
        }
    }

    // Get popular categories (by product count)
    static async getPopular(limit = 10) {
        const query = `
            SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            WHERE c.is_active = true
            GROUP BY c.id
            HAVING COUNT(p.id) > 0
            ORDER BY product_count DESC, c.name ASC
            LIMIT $1
        `;

        try {
            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (error) {
            logger.error('Error getting popular categories:', error);
            throw error;
        }
    }

    // Check if slug is unique
    static async isSlugUnique(slug, excludeId = null) {
        let query = 'SELECT id FROM categories WHERE slug = $1';
        const values = [slug];

        if (excludeId) {
            query += ' AND id != $2';
            values.push(excludeId);
        }

        try {
            const result = await pool.query(query, values);
            return result.rows.length === 0;
        } catch (error) {
            logger.error('Error checking slug uniqueness:', error);
            throw error;
        }
    }
}

module.exports = Category;
