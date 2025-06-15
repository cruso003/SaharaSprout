const Product = require('../models/Product');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// Generate cache keys
const generateCacheKey = (prefix, params) => {
    const paramString = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
    return `${prefix}:${paramString}`;
};

const productController = {
    // Create a new product
    createProduct: async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const productData = {
                ...req.body,
                farmer_id: req.user.id // From auth middleware
            };

            const product = await Product.create(productData);

            // Invalidate relevant caches
            await cache.invalidatePattern('products:*');
            await cache.invalidatePattern('categories:*');

            logger.info(`Product created: ${product.id}`, { 
                productId: product.id, 
                farmerId: req.user.id 
            });

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });

        } catch (error) {
            logger.error('Error creating product:', error);
            
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({
                    success: false,
                    message: 'Product with this SKU or slug already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create product'
            });
        }
    },

    // Get all products with pagination and filters
    getProducts: async (req, res) => {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: Math.min(parseInt(req.query.limit) || 20, 100), // Max 100 items per page
                category_id: req.query.category_id,
                farmer_id: req.query.farmer_id,
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
                is_featured: req.query.is_featured !== undefined ? req.query.is_featured === 'true' : undefined,
                search: req.query.search,
                min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                sort_by: req.query.sort_by,
                sort_order: req.query.sort_order
            };

            // Generate cache key
            const cacheKey = generateCacheKey('products', options);
            
            // Try to get from cache first
            let result = await cache.get(cacheKey);
            
            if (!result) {
                result = await Product.findAll(options);
                // Cache for 5 minutes
                await cache.set(cacheKey, result, 300);
            }

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });

        } catch (error) {
            logger.error('Error getting products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve products'
            });
        }
    },

    // Get a single product by ID
    getProduct: async (req, res) => {
        try {
            const { id } = req.params;

            // Try cache first
            const cacheKey = `product:${id}`;
            let product = await cache.get(cacheKey);

            if (!product) {
                product = await Product.findById(id);
                if (product) {
                    // Cache for 10 minutes
                    await cache.set(cacheKey, product, 600);
                }
            }

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Increment view count (don't await to avoid blocking response)
            Product.incrementView(id).catch(err => 
                logger.error('Error incrementing view count:', err)
            );

            res.json({
                success: true,
                data: product
            });

        } catch (error) {
            logger.error('Error getting product:', error);
            
            if (error.message === 'Invalid product ID format') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve product'
            });
        }
    },

    // Update a product
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            // First check if product exists and user has permission
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Check if user owns the product or is admin
            if (existingProduct.farmer_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own products'
                });
            }

            const updatedProduct = await Product.update(id, req.body);

            // Invalidate caches
            await cache.del(`product:${id}`);
            await cache.invalidatePattern('products:*');

            logger.info(`Product updated: ${id}`, { 
                productId: id, 
                userId: req.user.id 
            });

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: updatedProduct
            });

        } catch (error) {
            logger.error('Error updating product:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    message: 'Product with this SKU or slug already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update product'
            });
        }
    },

    // Delete a product (soft delete)
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if product exists and user has permission
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Check if user owns the product or is admin
            if (existingProduct.farmer_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own products'
                });
            }

            const deleted = await Product.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Invalidate caches
            await cache.del(`product:${id}`);
            await cache.invalidatePattern('products:*');

            logger.info(`Product deleted: ${id}`, { 
                productId: id, 
                userId: req.user.id 
            });

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });

        } catch (error) {
            logger.error('Error deleting product:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete product'
            });
        }
    },

    // Search products
    searchProducts: async (req, res) => {
        try {
            const { q: searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term must be at least 2 characters long'
                });
            }

            const options = {
                page: parseInt(req.query.page) || 1,
                limit: Math.min(parseInt(req.query.limit) || 20, 100),
                category_id: req.query.category_id,
                min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
                tags: req.query.tags ? req.query.tags.split(',') : undefined
            };

            // Generate cache key
            const cacheKey = generateCacheKey('search', { term: searchTerm, ...options });
            
            // Try cache first
            let products = await cache.get(cacheKey);
            
            if (!products) {
                products = await Product.search(searchTerm, options);
                // Cache search results for 2 minutes
                await cache.set(cacheKey, products, 120);
            }

            res.json({
                success: true,
                data: products,
                searchTerm
            });

        } catch (error) {
            logger.error('Error searching products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search products'
            });
        }
    },

    // Update product stock
    updateStock: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity, movement_type = 'ADJUSTMENT', reference_id, notes } = req.body;

            if (typeof quantity !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be a number'
                });
            }

            // Check if product exists and user has permission
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            if (existingProduct.farmer_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update stock for your own products'
                });
            }

            const result = await Product.updateStock(
                id, 
                quantity, 
                movement_type, 
                reference_id, 
                req.user.id, 
                notes
            );

            // Invalidate caches
            await cache.del(`product:${id}`);
            await cache.invalidatePattern('products:*');

            logger.info(`Stock updated for product: ${id}`, { 
                productId: id, 
                quantity, 
                previous: result.previous,
                current: result.current,
                userId: req.user.id 
            });

            res.json({
                success: true,
                message: 'Stock updated successfully',
                data: {
                    productId: id,
                    previousStock: result.previous,
                    currentStock: result.current,
                    movement: quantity
                }
            });

        } catch (error) {
            logger.error('Error updating stock:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            if (error.message === 'Insufficient stock') {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for this operation'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update stock'
            });
        }
    },

    // Get featured products
    getFeaturedProducts: async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 12, 50);
            
            const cacheKey = `featured_products:limit:${limit}`;
            let result = await cache.get(cacheKey);
            
            if (!result) {
                result = await Product.findAll({
                    is_featured: true,
                    is_active: true,
                    limit,
                    sort_by: 'created_at',
                    sort_order: 'DESC'
                });
                // Cache for 15 minutes
                await cache.set(cacheKey, result, 900);
            }

            res.json({
                success: true,
                data: result.data
            });

        } catch (error) {
            logger.error('Error getting featured products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve featured products'
            });
        }
    },

    // Get farmer's products
    getFarmerProducts: async (req, res) => {
        try {
            const farmerId = req.params.farmerId || req.user.id;
            
            // If requesting another farmer's products, only show active ones
            // If requesting own products, show all
            const isOwnProducts = farmerId === req.user.id;
            
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: Math.min(parseInt(req.query.limit) || 20, 100),
                farmer_id: farmerId,
                is_active: isOwnProducts ? req.query.is_active : true,
                sort_by: req.query.sort_by || 'created_at',
                sort_order: req.query.sort_order || 'DESC'
            };

            const result = await Product.findAll(options);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });

        } catch (error) {
            logger.error('Error getting farmer products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve farmer products'
            });
        }
    }
};

module.exports = productController;
