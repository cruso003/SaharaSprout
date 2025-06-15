const { query } = require('../config/database');

class Cart {
    static async addItem(userId, productId, quantity, productData = null) {
        try {
            const result = await query(`
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET 
                    quantity = cart_items.quantity + EXCLUDED.quantity,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [userId, productId, quantity]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateItem(userId, productId, quantity) {
        const result = await query(`
            UPDATE cart_items 
            SET quantity = $3, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND product_id = $2
            RETURNING *
        `, [userId, productId, quantity]);

        return result.rows[0] || null;
    }

    static async removeItem(userId, productId) {
        const result = await query(`
            DELETE FROM cart_items 
            WHERE user_id = $1 AND product_id = $2
            RETURNING *
        `, [userId, productId]);

        return result.rows[0] || null;
    }

    static async getUserCart(userId) {
        const result = await query(`
            SELECT * FROM cart_items 
            WHERE user_id = $1 
            ORDER BY added_at DESC
        `, [userId]);

        return result.rows;
    }

    static async clearUserCart(userId) {
        const result = await query(`
            DELETE FROM cart_items 
            WHERE user_id = $1
            RETURNING COUNT(*) as deleted_count
        `, [userId]);

        return result.rows[0]?.deleted_count || 0;
    }

    static async getCartTotal(userId) {
        // This would typically join with products table to get current prices
        // For now, we'll return basic info from cart items
        const result = await query(`
            SELECT 
                COUNT(*) as item_count,
                SUM(quantity) as total_quantity
            FROM cart_items 
            WHERE user_id = $1
        `, [userId]);

        return result.rows[0];
    }

    static async getCartSummary(userId) {
        const items = await this.getUserCart(userId);
        const total = await this.getCartTotal(userId);
        
        return {
            items,
            summary: {
                itemCount: parseInt(total.item_count),
                totalQuantity: parseFloat(total.total_quantity) || 0,
                estimatedTotal: 0 // Would calculate from product prices
            }
        };
    }
}

module.exports = Cart;
