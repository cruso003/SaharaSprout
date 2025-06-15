const { body, param, query } = require('express-validator');

// Product validation rules
const productValidation = {
    // Create product validation
    create: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Product name must be between 2 and 255 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description must not exceed 2000 characters'),
        
        body('slug')
            .trim()
            .isLength({ min: 2, max: 255 })
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
        
        body('sku')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('SKU must not exceed 100 characters'),
        
        body('category_id')
            .isUUID()
            .withMessage('Category ID must be a valid UUID'),
        
        body('price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        
        body('currency')
            .optional()
            .isIn(['XOF', 'USD', 'EUR', 'CFA'])
            .withMessage('Currency must be one of: XOF, USD, EUR, CFA'),
        
        body('unit')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Unit must be between 1 and 50 characters'),
        
        body('min_order_quantity')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Minimum order quantity must be at least 1'),
        
        body('max_order_quantity')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Maximum order quantity must be at least 1'),
        
        body('stock_quantity')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Stock quantity must be non-negative'),
        
        body('is_organic')
            .optional()
            .isBoolean()
            .withMessage('Is organic must be a boolean'),
        
        body('harvest_date')
            .optional()
            .isISO8601()
            .withMessage('Harvest date must be a valid date'),
        
        body('expiry_date')
            .optional()
            .isISO8601()
            .withMessage('Expiry date must be a valid date'),
        
        body('origin_location')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Origin location must not exceed 255 characters'),
        
        body('is_active')
            .optional()
            .isBoolean()
            .withMessage('Is active must be a boolean'),
        
        body('is_featured')
            .optional()
            .isBoolean()
            .withMessage('Is featured must be a boolean'),
        
        body('weight')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Weight must be a positive number'),
        
        body('dimensions')
            .optional()
            .isObject()
            .withMessage('Dimensions must be an object'),
        
        body('nutritional_info')
            .optional()
            .isObject()
            .withMessage('Nutritional info must be an object'),
        
        body('certifications')
            .optional()
            .isArray()
            .withMessage('Certifications must be an array'),
        
        body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array'),
        
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array'),
        
        body('images.*.url')
            .optional()
            .isURL()
            .withMessage('Image URL must be valid'),
        
        body('images.*.alt_text')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Image alt text must not exceed 255 characters')
    ],

    // Update product validation
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Product name must be between 2 and 255 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description must not exceed 2000 characters'),
        
        body('slug')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 })
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
        
        body('sku')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('SKU must not exceed 100 characters'),
        
        body('category_id')
            .optional()
            .isUUID()
            .withMessage('Category ID must be a valid UUID'),
        
        body('price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        
        body('currency')
            .optional()
            .isIn(['XOF', 'USD', 'EUR', 'CFA'])
            .withMessage('Currency must be one of: XOF, USD, EUR, CFA'),
        
        body('unit')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Unit must be between 1 and 50 characters'),
        
        body('min_order_quantity')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Minimum order quantity must be at least 1'),
        
        body('max_order_quantity')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Maximum order quantity must be at least 1'),
        
        body('stock_quantity')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Stock quantity must be non-negative'),
        
        body('is_organic')
            .optional()
            .isBoolean()
            .withMessage('Is organic must be a boolean'),
        
        body('harvest_date')
            .optional()
            .isISO8601()
            .withMessage('Harvest date must be a valid date'),
        
        body('expiry_date')
            .optional()
            .isISO8601()
            .withMessage('Expiry date must be a valid date'),
        
        body('origin_location')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Origin location must not exceed 255 characters'),
        
        body('is_active')
            .optional()
            .isBoolean()
            .withMessage('Is active must be a boolean'),
        
        body('is_featured')
            .optional()
            .isBoolean()
            .withMessage('Is featured must be a boolean'),
        
        body('weight')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Weight must be a positive number'),
        
        body('dimensions')
            .optional()
            .isObject()
            .withMessage('Dimensions must be an object'),
        
        body('nutritional_info')
            .optional()
            .isObject()
            .withMessage('Nutritional info must be an object'),
        
        body('certifications')
            .optional()
            .isArray()
            .withMessage('Certifications must be an array'),
        
        body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array'),
        
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array'),
        
        body('images.*.url')
            .optional()
            .isURL()
            .withMessage('Image URL must be valid'),
        
        body('images.*.alt_text')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Image alt text must not exceed 255 characters')
    ],

    // Stock update validation
    updateStock: [
        body('quantity')
            .isInt()
            .withMessage('Quantity must be an integer'),
        
        body('movement_type')
            .optional()
            .isIn(['IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED'])
            .withMessage('Movement type must be one of: IN, OUT, ADJUSTMENT, RESERVED, RELEASED'),
        
        body('reference_id')
            .optional()
            .isUUID()
            .withMessage('Reference ID must be a valid UUID'),
        
        body('notes')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Notes must not exceed 500 characters')
    ],

    // Parameter validation
    validateId: [
        param('id')
            .isUUID()
            .withMessage('Product ID must be a valid UUID')
    ],

    validateFarmerId: [
        param('farmerId')
            .isUUID()
            .withMessage('Farmer ID must be a valid UUID')
    ],

    // Query validation
    validateQuery: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        
        query('category_id')
            .optional()
            .isUUID()
            .withMessage('Category ID must be a valid UUID'),
        
        query('farmer_id')
            .optional()
            .isUUID()
            .withMessage('Farmer ID must be a valid UUID'),
        
        query('is_active')
            .optional()
            .isIn(['true', 'false'])
            .withMessage('Is active must be true or false'),
        
        query('is_featured')
            .optional()
            .isIn(['true', 'false'])
            .withMessage('Is featured must be true or false'),
        
        query('min_price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Min price must be a positive number'),
        
        query('max_price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Max price must be a positive number'),
        
        query('sort_by')
            .optional()
            .isIn(['created_at', 'name', 'price', 'rating_average', 'view_count', 'order_count'])
            .withMessage('Sort by must be one of: created_at, name, price, rating_average, view_count, order_count'),
        
        query('sort_order')
            .optional()
            .isIn(['ASC', 'DESC', 'asc', 'desc'])
            .withMessage('Sort order must be ASC or DESC'),
        
        query('search')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Search term must be between 2 and 100 characters'),
        
        query('q')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Search query must be between 2 and 100 characters')
    ]
};

module.exports = productValidation;
