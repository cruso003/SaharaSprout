const { body, param, query } = require('express-validator');

// Category validation rules
const categoryValidation = {
    // Create category validation
    create: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Category name must be between 2 and 255 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        
        body('slug')
            .trim()
            .isLength({ min: 2, max: 255 })
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
        
        body('image_url')
            .optional()
            .isURL()
            .withMessage('Image URL must be valid'),
        
        body('parent_id')
            .optional()
            .isUUID()
            .withMessage('Parent ID must be a valid UUID'),
        
        body('is_active')
            .optional()
            .isBoolean()
            .withMessage('Is active must be a boolean'),
        
        body('sort_order')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Sort order must be a non-negative integer')
    ],

    // Update category validation
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Category name must be between 2 and 255 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        
        body('slug')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 })
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
        
        body('image_url')
            .optional()
            .isURL()
            .withMessage('Image URL must be valid'),
        
        body('parent_id')
            .optional()
            .isUUID()
            .withMessage('Parent ID must be a valid UUID'),
        
        body('is_active')
            .optional()
            .isBoolean()
            .withMessage('Is active must be a boolean'),
        
        body('sort_order')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Sort order must be a non-negative integer')
    ],

    // Parameter validation
    validateId: [
        param('id')
            .isUUID()
            .withMessage('Category ID must be a valid UUID')
    ],

    validateIdentifier: [
        param('identifier')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Category identifier is required')
    ],

    // Query validation
    validateQuery: [
        query('parent_id')
            .optional()
            .custom((value) => {
                if (value === 'null') return true;
                if (!value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
                    throw new Error('Parent ID must be a valid UUID or "null"');
                }
                return true;
            }),
        
        query('is_active')
            .optional()
            .isIn(['true', 'false'])
            .withMessage('Is active must be true or false'),
        
        query('include_product_count')
            .optional()
            .isIn(['true', 'false'])
            .withMessage('Include product count must be true or false'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('Limit must be between 1 and 50')
    ]
};

module.exports = categoryValidation;
