const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Customer adds item to cart
router.post('/', protect, cartController.addToCart);

// Customer views their cart
router.get('/', protect, cartController.getCart);

// Customer updates item quantity
router.put('/:itemId', protect, cartController.updateCartItem);

// Customer removes item from cart
router.delete('/:itemId', protect, cartController.removeFromCart);

module.exports = router;
