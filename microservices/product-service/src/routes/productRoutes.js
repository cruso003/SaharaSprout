const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { verifyToken, requireFarmer, optionalAuth } = require('../middleware/auth');
const productValidation = require('../validation/productValidation');

// Public routes (no authentication required)
router.get('/', productValidation.validateQuery, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productValidation.validateQuery, productController.searchProducts);
router.get('/:id', productValidation.validateId, optionalAuth, productController.getProduct);

// Farmer routes (require farmer role)
router.post('/', 
    verifyToken, 
    requireFarmer, 
    productValidation.create, 
    productController.createProduct
);

router.put('/:id', 
    verifyToken, 
    requireFarmer, 
    productValidation.validateId, 
    productValidation.update, 
    productController.updateProduct
);

router.delete('/:id', 
    verifyToken, 
    requireFarmer, 
    productValidation.validateId, 
    productController.deleteProduct
);

router.patch('/:id/stock', 
    verifyToken, 
    requireFarmer, 
    productValidation.validateId, 
    productValidation.updateStock, 
    productController.updateStock
);

// Get farmer's products
router.get('/farmer/:farmerId', 
    productValidation.validateFarmerId, 
    productValidation.validateQuery, 
    optionalAuth, 
    productController.getFarmerProducts
);

// Get own products (authenticated farmer)
router.get('/my/products', 
    verifyToken, 
    requireFarmer, 
    productValidation.validateQuery, 
    productController.getFarmerProducts
);

module.exports = router;
