const express = require('express');
const router = express.Router();
const portalSettingsController = require('../controllers/portalSettingsController');
const { protect, authenticateAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/portal-settings
// @desc    Get portal settings (public)
// @access  Public
router.get('/', portalSettingsController.getSettings);

// @route   PUT /api/portal-settings
// @desc    Update portal settings
// @access  Private (Admin)
router.put('/', authenticateAdmin, portalSettingsController.updateSettings);

// @route   POST /api/portal-settings/upload-logo
// @desc    Upload portal logo
// @access  Private (Admin)
router.post('/upload-logo', authenticateAdmin, upload.single('logo'), portalSettingsController.uploadLogo);

// @route   POST /api/portal-settings/reset
// @desc    Reset portal settings to default
// @access  Private (Admin)
router.post('/reset', authenticateAdmin, portalSettingsController.resetSettings);

module.exports = router; 