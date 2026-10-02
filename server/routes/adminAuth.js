const express = require('express');
const { adminLogin, getAdminProfile } = require('../controllers/adminAuthController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', adminLogin);

// GET /api/admin/auth/me
router.get('/me', adminAuth, getAdminProfile);

module.exports = router;
