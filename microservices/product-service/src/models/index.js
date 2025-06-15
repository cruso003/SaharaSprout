const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Create all necessary tables for the product service
const createTables = async () => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Categories table
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                slug VARCHAR(255) NOT NULL UNIQUE,
                image_url VARCHAR(500),
                parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                slug VARCHAR(255) NOT NULL UNIQUE,
                sku VARCHAR(100) UNIQUE,
                category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
                farmer_id UUID NOT NULL,
                price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
                currency VARCHAR(3) DEFAULT 'XOF',
                unit VARCHAR(50) NOT NULL DEFAULT 'kg',
                min_order_quantity INTEGER DEFAULT 1,
                max_order_quantity INTEGER,
                stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
                is_organic BOOLEAN DEFAULT false,
                harvest_date DATE,
                expiry_date DATE,
                origin_location VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                is_featured BOOLEAN DEFAULT false,
                weight DECIMAL(8,3),
                dimensions JSONB,
                nutritional_info JSONB,
                certifications TEXT[],
                tags TEXT[],
                search_vector tsvector,
                rating_average DECIMAL(3,2) DEFAULT 0.0 CHECK (rating_average >= 0 AND rating_average <= 5),
                rating_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                order_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Product images table
        await client.query(`
            CREATE TABLE IF NOT EXISTS product_images (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                image_url VARCHAR(500) NOT NULL,
                alt_text VARCHAR(255),
                is_primary BOOLEAN DEFAULT false,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Product variants table (for different sizes, qualities, etc.)
        await client.query(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(100) UNIQUE,
                price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
                stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
                attributes JSONB,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Product reviews table
        await client.query(`
            CREATE TABLE IF NOT EXISTS product_reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                title VARCHAR(255),
                comment TEXT,
                is_verified_purchase BOOLEAN DEFAULT false,
                is_approved BOOLEAN DEFAULT true,
                helpful_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(product_id, user_id)
            )
        `);

        // Inventory tracking table
        await client.query(`
            CREATE TABLE IF NOT EXISTS inventory_movements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
                movement_type VARCHAR(50) NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED'
                quantity INTEGER NOT NULL,
                previous_quantity INTEGER NOT NULL,
                new_quantity INTEGER NOT NULL,
                reference_type VARCHAR(50), -- 'ORDER', 'PURCHASE', 'ADJUSTMENT', 'RETURN'
                reference_id UUID,
                notes TEXT,
                created_by UUID NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
            CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
            CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
            CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
            CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
            CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
            CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
            CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
            CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);
            CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);
            
            CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
            CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
            CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
            
            CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
            CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
            
            CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
            CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
            
            CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
            CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
            CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
            
            CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
            CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(variant_id);
            CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);
        `);

        // Create function to update search vector
        await client.query(`
            CREATE OR REPLACE FUNCTION update_product_search_vector()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.search_vector := 
                    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
                    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
                    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
                    setweight(to_tsvector('english', COALESCE(NEW.origin_location, '')), 'D');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create trigger for search vector
        await client.query(`
            DROP TRIGGER IF EXISTS trigger_update_product_search_vector ON products;
            CREATE TRIGGER trigger_update_product_search_vector
                BEFORE INSERT OR UPDATE ON products
                FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();
        `);

        // Create function to update product rating
        await client.query(`
            CREATE OR REPLACE FUNCTION update_product_rating()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE products SET 
                    rating_average = (
                        SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
                        FROM product_reviews 
                        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
                        AND is_approved = true
                    ),
                    rating_count = (
                        SELECT COUNT(*)
                        FROM product_reviews 
                        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
                        AND is_approved = true
                    )
                WHERE id = COALESCE(NEW.product_id, OLD.product_id);
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create trigger for rating updates
        await client.query(`
            DROP TRIGGER IF EXISTS trigger_update_product_rating ON product_reviews;
            CREATE TRIGGER trigger_update_product_rating
                AFTER INSERT OR UPDATE OR DELETE ON product_reviews
                FOR EACH ROW EXECUTE FUNCTION update_product_rating();
        `);

        // Create updated_at trigger function
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create updated_at triggers
        await client.query(`
            DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
            CREATE TRIGGER update_categories_updated_at
                BEFORE UPDATE ON categories
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
                
            DROP TRIGGER IF EXISTS update_products_updated_at ON products;
            CREATE TRIGGER update_products_updated_at
                BEFORE UPDATE ON products
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
                
            DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
            CREATE TRIGGER update_product_variants_updated_at
                BEFORE UPDATE ON product_variants
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
                
            DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
            CREATE TRIGGER update_product_reviews_updated_at
                BEFORE UPDATE ON product_reviews
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await client.query('COMMIT');
        logger.info('Product service tables created successfully');

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating product service tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createTables
};
