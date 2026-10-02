const express = require('express');
const { getReports, updateReport } = require('../controllers/adminReportsController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Admin-only routes
router.get('/', adminAuth, getReports);
router.patch('/:id', adminAuth, updateReport);

module.exports = router;
