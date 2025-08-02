const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateAdmin, authenticateCustomer } = require('../middleware/authMiddleware');

/* ---------------------- CUSTOMER SELF-SERVICE ROUTES ---------------------- */
// These routes are for customers to manage their own profile

// ✅ Get own profile
router.get('/me', authenticateCustomer, customerController.getProfile);

// ✅ Update own profile (name, email)
router.put('/update-profile', authenticateCustomer, customerController.updateProfile);

// ✅ Change own password
router.put('/change-password', authenticateCustomer, customerController.changePassword);


/* ---------------------- ADMIN ROUTES ---------------------- */
// These routes are for admin users to manage customers

// ✅ GET all customers (with search, filter, pagination)
router.get('/', authenticateAdmin, customerController.getCustomers);

// ✅ GET single customer (View)
router.get('/:id', authenticateAdmin, customerController.getCustomerById);

// ✅ CREATE a customer
router.post('/', authenticateAdmin, customerController.createCustomer);

// ✅ UPDATE customer details (name/email)
router.put('/:id', authenticateAdmin, customerController.updateCustomer);

// ✅ RESET customer password
router.put('/:id/reset-password', authenticateAdmin, customerController.resetPassword);

// ✅ Enable Portal Access
router.put('/:id/enable-portal', authenticateAdmin, customerController.enablePortal);

// ✅ Disable Portal Access
router.put('/:id/disable-portal', authenticateAdmin, customerController.disablePortal);

// ✅ BLOCK customer
router.patch('/:id/block', authenticateAdmin, customerController.blockCustomer);

// ✅ UNBLOCK customer
router.patch('/:id/unblock', authenticateAdmin, customerController.unblockCustomer);

// ✅ DELETE a customer
router.delete('/:id', authenticateAdmin, customerController.deleteCustomer);

// ✅ Impersonate customer (for admin login as customer)
router.post('/:id/impersonate', authenticateAdmin, customerController.impersonateCustomer);

module.exports = router;
