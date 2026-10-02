const express = require('express');
const ModerationLog = require('../models/ModerationLog');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/logs — paginated audit log
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 30, action, adminId } = req.query;

    const query = {};
    if (action) query.action = action;
    if (adminId) query.admin = adminId;

    const total = await ModerationLog.countDocuments(query);
    const logs = await ModerationLog.find(query)
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
