const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authenticateCustomer } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ✅ Public Route — Customer-facing product list with pagination
router.get('/public', productController.getPublicProducts);

// ✅ Customer-only route — Recommended products (requires login)
router.get('/recommendations', authenticateCustomer, productController.getRecommendedProducts);

// ✅ Admin Routes — Protected with JWT middleware
router.get('/', protect, productController.getProducts);                            // Admin: List all products
router.post('/', protect, upload.single('image'), productController.createProduct); // Admin: Add new product
router.put('/:id', protect, upload.single('image'), productController.updateProduct); // Admin: Update product
router.delete('/:id', protect, productController.deleteProduct);                    // Admin: Delete product

module.exports = router;
