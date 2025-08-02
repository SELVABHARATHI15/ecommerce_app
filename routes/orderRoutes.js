const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authenticateAdmin } = require('../middleware/authMiddleware');

/* ---------------------- CUSTOMER ROUTES ---------------------- */

// ✅ Place a new order (Customer or Admin)
router.post('/', protect, orderController.placeOrder);

// ✅ View orders placed by the currently logged-in customer
router.get('/my', protect, orderController.getMyOrders);

/* ---------------------- ROUTE TEST (FOR DEBUGGING) ---------------------- */

// ✅ Simple test route (ensure this is above /:id to avoid conflict)
router.get('/test', (req, res) => {
  res.send('✅ Order route is working!');
});

/* ---------------------- ADMIN ROUTES ---------------------- */

// ✅ View all orders (admin only)
router.get('/', authenticateAdmin, orderController.getOrders);

// ✅ Get a specific order by ID (admin only)
router.get('/:id', authenticateAdmin, orderController.getOrderById);

// ✅ Update a specific order (admin only)
router.put('/:id', authenticateAdmin, orderController.updateOrder);

// ✅ Delete a specific order (admin only)
router.delete('/:id', authenticateAdmin, orderController.deleteOrder);

module.exports = router;
