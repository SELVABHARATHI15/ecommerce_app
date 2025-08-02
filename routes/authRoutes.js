const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authenticateAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new customer
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login for customers and admins
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, authController.changePassword);

// @route   POST /api/auth/seed-admin
// @desc    Seed admin user (for initial setup)
// @access  Public
router.post('/seed-admin', authController.seedAdmin);

// @route   POST /api/auth/impersonate/:customerId
// @desc    Impersonate a customer (Admin only)
// @access  Private (Admin)
router.post('/impersonate/:customerId', authenticateAdmin, authController.impersonateCustomer);

module.exports = router;
