const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Product {
    // Create a new product
    static async create(productData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            const {
                name,
                description,
                slug,
                sku,
                category_id,
                farmer_id,
                price,
                currency = 'XOF',
                unit = 'kg',
                min_order_quantity = 1,
                max_order_quantity,
                stock_quantity = 0,
                is_organic = false,
                harvest_date,
                expiry_date,
                origin_location,
                is_active = true,
                is_featured = false,
                weight,
                dimensions,
                nutritional_info,
                certifications,
                tags,
                images = []
            } = productData;

            // Insert product
            const productQuery = `
                INSERT INTO products (
                    name, description, slug, sku, category_id, farmer_id, price, currency,
                    unit, min_order_quantity, max_order_quantity, stock_quantity, is_organic,
                    harvest_date, expiry_date, origin_location, is_active, is_featured,
                    weight, dimensions, nutritional_info, certifications, tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                RETURNING *
            `;

            const productValues = [
                name, description, slug, sku, category_id, farmer_id, price, currency,
                unit, min_order_quantity, max_order_quantity, stock_quantity, is_organic,
                harvest_date, expiry_date, origin_location, is_active, is_featured,
                weight, dimensions, nutritional_info, certifications, tags
            ];

            const result = await client.query(productQuery, productValues);
            const product = result.rows[0];

            // Insert product images if provided
            if (images && images.length > 0) {
                const imagePromises = images.map((image, index) => {
                    const imageQuery = `
                        INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
                        VALUES ($1, $2, $3, $4, $5)
                    `;
                    return client.query(imageQuery, [
                        product.id,
                        image.url,
                        image.alt_text || `${name} image ${index + 1}`,
                        index === 0, // First image is primary
                        index
                    ]);
                });
                await Promise.all(imagePromises);
            }

            await client.query('COMMIT');
            
            // Return product with images
            const productWithImages = await this.findById(product.id);
            return productWithImages;

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating product:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Find product by ID with all related data
    static async findById(id) {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error('Invalid product ID format');
        }

        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', pi.id,
                            'image_url', pi.image_url,
                            'alt_text', pi.alt_text,
                            'is_primary', pi.is_primary,
                            'sort_order', pi.sort_order
                        ) ORDER BY pi.sort_order
                    ) FILTER (WHERE pi.id IS NOT NULL), 
                    '[]'::json
                ) as images
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = $1
            GROUP BY p.id, c.name, c.slug
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    // Find all products with pagination and filters
    static async findAll(options = {}) {
        let {
            page = 1,
            limit = 20,
            category_id,
            farmer_id,
            is_active = true,
            is_featured,
            search,
            min_price,
            max_price,
            tags,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = options;

        // Validate and sanitize inputs
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, Math.min(100, parseInt(limit) || 20)); // Ensure limit is between 1 and 100
        
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        // Build WHERE conditions
        if (is_active !== undefined) {
            conditions.push(`p.is_active = $${paramIndex++}`);
            values.push(is_active);
        }

        if (category_id) {
            conditions.push(`p.category_id = $${paramIndex++}`);
            values.push(category_id);
        }

        if (farmer_id) {
            conditions.push(`p.farmer_id = $${paramIndex++}`);
            values.push(farmer_id);
        }

        if (is_featured !== undefined) {
            conditions.push(`p.is_featured = $${paramIndex++}`);
            values.push(is_featured);
        }

        if (search) {
            conditions.push(`p.search_vector @@ plainto_tsquery('english', $${paramIndex++})`);
            values.push(search);
        }

        if (min_price) {
            conditions.push(`p.price >= $${paramIndex++}`);
            values.push(min_price);
        }

        if (max_price) {
            conditions.push(`p.price <= $${paramIndex++}`);
            values.push(max_price);
        }

        if (tags && tags.length > 0) {
            conditions.push(`p.tags && $${paramIndex++}`);
            values.push(tags);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Validate sort_by to prevent SQL injection
        const allowedSortFields = ['created_at', 'name', 'price', 'rating_average', 'view_count', 'order_count'];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', pi.id,
                            'image_url', pi.image_url,
                            'alt_text', pi.alt_text,
                            'is_primary', pi.is_primary,
                            'sort_order', pi.sort_order
                        ) ORDER BY pi.sort_order
                    ) FILTER (WHERE pi.id IS NOT NULL), 
                    '[]'::json
                ) as images
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            ${whereClause}
            GROUP BY p.id, c.name, c.slug
            ORDER BY p.${sortField} ${sortDirection}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        values.push(limit, offset);

        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
        `;

        const [productsResult, countResult] = await Promise.all([
            pool.query(query, values),
            pool.query(countQuery, values.slice(0, -2)) // Remove limit and offset for count
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return {
            data: productsResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    // Update product
    static async update(id, updateData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            const {
                images,
                ...productData
            } = updateData;

            // Build dynamic update query
            const fields = Object.keys(productData);
            const values = Object.values(productData);
            
            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
            values.push(id);

            const query = `
                UPDATE products 
                SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${fields.length + 1}
                RETURNING *
            `;

            const result = await client.query(query, values);
            
            if (result.rows.length === 0) {
                throw new Error('Product not found');
            }

            // Update images if provided
            if (images !== undefined) {
                // Delete existing images
                await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
                
                // Insert new images
                if (images.length > 0) {
                    const imagePromises = images.map((image, index) => {
                        const imageQuery = `
                            INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
                            VALUES ($1, $2, $3, $4, $5)
                        `;
                        return client.query(imageQuery, [
                            id,
                            image.url,
                            image.alt_text || `Product image ${index + 1}`,
                            index === 0,
                            index
                        ]);
                    });
                    await Promise.all(imagePromises);
                }
            }

            await client.query('COMMIT');
            
            // Return updated product with images
            const updatedProduct = await this.findById(id);
            return updatedProduct;

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating product:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Delete product (soft delete)
    static async delete(id) {
        const query = `
            UPDATE products 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;

        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
    }

    // Hard delete product
    static async hardDelete(id) {
        const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
    }

    // Update stock quantity
    static async updateStock(id, quantity, movement_type = 'ADJUSTMENT', reference_id = null, created_by, notes = null) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Get current stock
            const currentResult = await client.query('SELECT stock_quantity FROM products WHERE id = $1', [id]);
            if (currentResult.rows.length === 0) {
                throw new Error('Product not found');
            }

            const currentStock = currentResult.rows[0].stock_quantity;
            const newStock = currentStock + quantity;

            if (newStock < 0) {
                throw new Error('Insufficient stock');
            }

            // Update stock
            await client.query(
                'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [newStock, id]
            );

            // Record inventory movement
            await client.query(`
                INSERT INTO inventory_movements (
                    product_id, movement_type, quantity, previous_quantity, new_quantity,
                    reference_id, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [id, movement_type, quantity, currentStock, newStock, reference_id, notes, created_by]);

            await client.query('COMMIT');
            return { previous: currentStock, current: newStock };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating stock:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Increment view count
    static async incrementView(id) {
        const query = `
            UPDATE products 
            SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `;
        await pool.query(query, [id]);
    }

    // Search products with full-text search
    static async search(searchTerm, options = {}) {
        const {
            page = 1,
            limit = 20,
            category_id,
            min_price,
            max_price,
            tags
        } = options;

        const offset = (page - 1) * limit;
        const conditions = ['p.is_active = true'];
        const values = [searchTerm];
        let paramIndex = 2;

        // Add search condition
        conditions.push(`p.search_vector @@ plainto_tsquery('english', $1)`);

        if (category_id) {
            conditions.push(`p.category_id = $${paramIndex++}`);
            values.push(category_id);
        }

        if (min_price) {
            conditions.push(`p.price >= $${paramIndex++}`);
            values.push(min_price);
        }

        if (max_price) {
            conditions.push(`p.price <= $${paramIndex++}`);
            values.push(max_price);
        }

        if (tags && tags.length > 0) {
            conditions.push(`p.tags && $${paramIndex++}`);
            values.push(tags);
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug,
                ts_rank(p.search_vector, plainto_tsquery('english', $1)) as rank,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', pi.id,
                            'image_url', pi.image_url,
                            'alt_text', pi.alt_text,
                            'is_primary', pi.is_primary,
                            'sort_order', pi.sort_order
                        ) ORDER BY pi.sort_order
                    ) FILTER (WHERE pi.id IS NOT NULL), 
                    '[]'::json
                ) as images
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            ${whereClause}
            GROUP BY p.id, c.name, c.slug
            ORDER BY rank DESC, p.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        values.push(limit, offset);

        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = Product;
