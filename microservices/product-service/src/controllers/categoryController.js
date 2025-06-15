const Category = require('../models/Category');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

const categoryController = {
    // Create a new category
    createCategory: async (req, res) => {
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

            // Only admins can create categories
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can create categories'
                });
            }

            const category = await Category.create(req.body);

            // Invalidate category caches
            await cache.invalidatePattern('categories:*');

            logger.info(`Category created: ${category.id}`, { 
                categoryId: category.id, 
                userId: req.user.id 
            });

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });

        } catch (error) {
            logger.error('Error creating category:', error);
            
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({
                    success: false,
                    message: 'Category with this name or slug already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create category'
            });
        }
    },

    // Get all categories
    getCategories: async (req, res) => {
        try {
            const options = {
                parent_id: req.query.parent_id === 'null' ? null : req.query.parent_id,
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
                include_product_count: req.query.include_product_count !== 'false'
            };

            // Generate cache key
            const cacheKey = `categories:${JSON.stringify(options)}`;
            
            // Try cache first
            let categories = await cache.get(cacheKey);
            
            if (!categories) {
                categories = await Category.findAll(options);
                // Cache for 10 minutes
                await cache.set(cacheKey, categories, 600);
            }

            res.json({
                success: true,
                data: categories
            });

        } catch (error) {
            logger.error('Error getting categories:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve categories'
            });
        }
    },

    // Get category hierarchy
    getCategoryHierarchy: async (req, res) => {
        try {
            const cacheKey = 'categories:hierarchy';
            
            // Try cache first
            let hierarchy = await cache.get(cacheKey);
            
            if (!hierarchy) {
                hierarchy = await Category.getHierarchy();
                // Cache for 15 minutes
                await cache.set(cacheKey, hierarchy, 900);
            }

            res.json({
                success: true,
                data: hierarchy
            });

        } catch (error) {
            logger.error('Error getting category hierarchy:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve category hierarchy'
            });
        }
    },

    // Get a single category
    getCategory: async (req, res) => {
        try {
            const { identifier } = req.params;
            
            // Check if identifier is UUID (ID) or slug
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
            
            const cacheKey = `category:${identifier}`;
            let category = await cache.get(cacheKey);
            
            if (!category) {
                category = isUUID 
                    ? await Category.findById(identifier)
                    : await Category.findBySlug(identifier);
                
                if (category) {
                    // Cache for 10 minutes
                    await cache.set(cacheKey, category, 600);
                }
            }

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            res.json({
                success: true,
                data: category
            });

        } catch (error) {
            logger.error('Error getting category:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve category'
            });
        }
    },

    // Get subcategories
    getSubcategories: async (req, res) => {
        try {
            const { id } = req.params;
            
            const cacheKey = `subcategories:${id}`;
            let subcategories = await cache.get(cacheKey);
            
            if (!subcategories) {
                subcategories = await Category.getSubcategories(id);
                // Cache for 10 minutes
                await cache.set(cacheKey, subcategories, 600);
            }

            res.json({
                success: true,
                data: subcategories
            });

        } catch (error) {
            logger.error('Error getting subcategories:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve subcategories'
            });
        }
    },

    // Get category breadcrumbs
    getCategoryBreadcrumbs: async (req, res) => {
        try {
            const { id } = req.params;
            
            const cacheKey = `breadcrumbs:${id}`;
            let breadcrumbs = await cache.get(cacheKey);
            
            if (!breadcrumbs) {
                breadcrumbs = await Category.getBreadcrumbs(id);
                // Cache for 15 minutes
                await cache.set(cacheKey, breadcrumbs, 900);
            }

            res.json({
                success: true,
                data: breadcrumbs
            });

        } catch (error) {
            logger.error('Error getting category breadcrumbs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve category breadcrumbs'
            });
        }
    },

    // Get popular categories
    getPopularCategories: async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            
            const cacheKey = `categories:popular:${limit}`;
            let categories = await cache.get(cacheKey);
            
            if (!categories) {
                categories = await Category.getPopular(limit);
                // Cache for 20 minutes
                await cache.set(cacheKey, categories, 1200);
            }

            res.json({
                success: true,
                data: categories
            });

        } catch (error) {
            logger.error('Error getting popular categories:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve popular categories'
            });
        }
    },

    // Update a category
    updateCategory: async (req, res) => {
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

            // Only admins can update categories
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can update categories'
                });
            }

            const updatedCategory = await Category.update(id, req.body);

            // Invalidate caches
            await cache.invalidatePattern('categories:*');
            await cache.invalidatePattern('category:*');
            await cache.invalidatePattern('subcategories:*');
            await cache.invalidatePattern('breadcrumbs:*');

            logger.info(`Category updated: ${id}`, { 
                categoryId: id, 
                userId: req.user.id 
            });

            res.json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory
            });

        } catch (error) {
            logger.error('Error updating category:', error);
            
            if (error.message === 'Category not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    message: 'Category with this name or slug already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update category'
            });
        }
    },

    // Delete a category
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can delete categories
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can delete categories'
                });
            }

            const deleted = await Category.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Invalidate caches
            await cache.invalidatePattern('categories:*');
            await cache.invalidatePattern('category:*');
            await cache.invalidatePattern('subcategories:*');
            await cache.invalidatePattern('breadcrumbs:*');

            logger.info(`Category deleted: ${id}`, { 
                categoryId: id, 
                userId: req.user.id 
            });

            res.json({
                success: true,
                message: 'Category deleted successfully'
            });

        } catch (error) {
            logger.error('Error deleting category:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete category'
            });
        }
    },

    // Hard delete a category
    hardDeleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can hard delete categories
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can permanently delete categories'
                });
            }

            const deleted = await Category.hardDelete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Invalidate caches
            await cache.invalidatePattern('categories:*');
            await cache.invalidatePattern('category:*');
            await cache.invalidatePattern('subcategories:*');
            await cache.invalidatePattern('breadcrumbs:*');

            logger.info(`Category permanently deleted: ${id}`, { 
                categoryId: id, 
                userId: req.user.id 
            });

            res.json({
                success: true,
                message: 'Category permanently deleted'
            });

        } catch (error) {
            logger.error('Error hard deleting category:', error);
            
            if (error.message.includes('subcategories')) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category with subcategories'
                });
            }

            if (error.message.includes('products')) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category with products'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to permanently delete category'
            });
        }
    }
};

module.exports = categoryController;
