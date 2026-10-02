const express = require('express');
const { getStats } = require('../controllers/adminStatsController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', adminAuth, getStats);

module.exports = router;
