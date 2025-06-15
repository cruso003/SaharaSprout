const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const categoryValidation = require('../validation/categoryValidation');

// Public routes (no authentication required)
router.get('/', categoryValidation.validateQuery, categoryController.getCategories);
router.get('/hierarchy', categoryController.getCategoryHierarchy);
router.get('/popular', categoryValidation.validateQuery, categoryController.getPopularCategories);
router.get('/:identifier', categoryValidation.validateIdentifier, categoryController.getCategory);
router.get('/:id/subcategories', categoryValidation.validateId, categoryController.getSubcategories);
router.get('/:id/breadcrumbs', categoryValidation.validateId, categoryController.getCategoryBreadcrumbs);

// Admin routes (require admin role)
router.post('/', 
    verifyToken, 
    requireAdmin, 
    categoryValidation.create, 
    categoryController.createCategory
);

router.put('/:id', 
    verifyToken, 
    requireAdmin, 
    categoryValidation.validateId, 
    categoryValidation.update, 
    categoryController.updateCategory
);

router.delete('/:id', 
    verifyToken, 
    requireAdmin, 
    categoryValidation.validateId, 
    categoryController.deleteCategory
);

router.delete('/:id/hard', 
    verifyToken, 
    requireAdmin, 
    categoryValidation.validateId, 
    categoryController.hardDeleteCategory
);

module.exports = router;
