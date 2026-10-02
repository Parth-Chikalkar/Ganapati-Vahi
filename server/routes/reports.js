const express = require('express');
const { submitReport } = require('../controllers/adminReportsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports — user submits a report (requires user JWT)
router.post('/', auth, submitReport);

module.exports = router;
