const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
    static async create(orderData) {
        const {
            userId,
            farmId,
            items,
            deliveryAddress,
            deliveryMethod = 'pickup',
            notes,
            aiRecommendations
        } = orderData;

        const client = await require('../config/database').pool.connect();
        
        try {
            await client.query('BEGIN');

            // Calculate total amount
            let totalAmount = 0;
            items.forEach(item => {
                totalAmount += item.quantity * item.unitPrice;
            });

            // Create order
            const orderResult = await client.query(`
                INSERT INTO orders (
                    user_id, farm_id, total_amount, delivery_address, 
                    delivery_method, notes, ai_recommendations
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [userId, farmId, totalAmount, JSON.stringify(deliveryAddress || {}), deliveryMethod, notes, JSON.stringify(aiRecommendations || {})]);

            const order = orderResult.rows[0];

            // Create order items
            const orderItems = [];
            for (const item of items) {
                const itemResult = await client.query(`
                    INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price, 
                        total_price, product_snapshot
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [
                    order.id, 
                    item.productId, 
                    item.quantity, 
                    item.unitPrice,
                    item.quantity * item.unitPrice,
                    JSON.stringify(item.productSnapshot || {})
                ]);
                orderItems.push(itemResult.rows[0]);
            }

            // Create initial status history
            await client.query(`
                INSERT INTO order_status_history (order_id, status, notes)
                VALUES ($1, $2, $3)
            `, [order.id, 'pending', 'Order created']);

            await client.query('COMMIT');

            return {
                ...order,
                items: orderItems
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async findById(orderId) {
        const orderResult = await query(`
            SELECT * FROM orders WHERE id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            return null;
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await query(`
            SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at
        `, [orderId]);

        // Get status history
        const historyResult = await query(`
            SELECT * FROM order_status_history 
            WHERE order_id = $1 ORDER BY created_at DESC
        `, [orderId]);

        // Get delivery tracking
        const trackingResult = await query(`
            SELECT * FROM delivery_tracking 
            WHERE order_id = $1 ORDER BY created_at DESC
        `, [orderId]);

        // Helper function to safely parse JSON (or return if already object)
        const safeParseJSON = (value) => {
            if (!value) return null;
            if (typeof value === 'object') return value;
            try {
                return JSON.parse(value);
            } catch (e) {
                console.warn('JSON parse error:', e.message);
                return null;
            }
        };

        return {
            ...order,
            delivery_address: safeParseJSON(order.delivery_address),
            ai_recommendations: safeParseJSON(order.ai_recommendations),
            items: itemsResult.rows.map(item => ({
                ...item,
                product_snapshot: safeParseJSON(item.product_snapshot)
            })),
            statusHistory: historyResult.rows,
            tracking: trackingResult.rows
        };
    }

    static async findByUserId(userId, options = {}) {
        const { limit = 20, offset = 0, status } = options;
        
        let whereClause = 'WHERE user_id = $1';
        let params = [userId];
        
        if (status) {
            whereClause += ' AND status = $2';
            params.push(status);
        }

        const result = await query(`
            SELECT o.*, 
                   COUNT(oi.id) as item_count,
                   ARRAY_AGG(oi.product_id) as product_ids
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereClause}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        return result.rows;
    }

    static async findByFarmId(farmId, options = {}) {
        const { limit = 20, offset = 0, status } = options;
        
        let whereClause = 'WHERE farm_id = $1';
        let params = [farmId];
        
        if (status) {
            whereClause += ' AND status = $2';
            params.push(status);
        }

        const result = await query(`
            SELECT o.*, 
                   COUNT(oi.id) as item_count,
                   ARRAY_AGG(oi.product_id) as product_ids
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereClause}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        return result.rows;
    }

    static async updateStatus(orderId, status, notes = null, changedBy = null) {
        const client = await require('../config/database').pool.connect();
        
        try {
            await client.query('BEGIN');

            // Update order status
            const orderResult = await client.query(`
                UPDATE orders 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [status, orderId]);

            if (orderResult.rows.length === 0) {
                throw new Error('Order not found');
            }

            // Add status history
            await client.query(`
                INSERT INTO order_status_history (order_id, status, notes, changed_by)
                VALUES ($1, $2, $3, $4)
            `, [orderId, status, notes, changedBy]);

            await client.query('COMMIT');
            return orderResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async addDeliveryTracking(orderId, trackingData) {
        const { status, location, coordinates, estimatedArrival, notes } = trackingData;
        
        // Convert coordinates object to PostgreSQL POINT format
        let pointString = null;
        if (coordinates && coordinates.lat && coordinates.lng) {
            pointString = `(${coordinates.lng},${coordinates.lat})`; // PostgreSQL POINT format: (x,y)
        }

        const result = await query(`
            INSERT INTO delivery_tracking (
                order_id, status, location, coordinates, estimated_arrival, notes
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [orderId, status, location, pointString, estimatedArrival, notes]);

        return result.rows[0];
    }

    static async getOrderStats(timeframe = '30 days') {
        const result = await query(`
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as average_order_value
            FROM orders 
            WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        `);

        return result.rows[0];
    }

    static async getTopProducts(limit = 10) {
        const result = await query(`
            SELECT 
                oi.product_id,
                COUNT(*) as order_count,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY oi.product_id
            ORDER BY order_count DESC
            LIMIT $1
        `, [limit]);

        return result.rows;
    }
}

module.exports = Order;
