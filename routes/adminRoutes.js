const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, getSummary } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/profile', authMiddleware, getAdminProfile);
router.get('/summary', authMiddleware, getSummary);

module.exports = router;
