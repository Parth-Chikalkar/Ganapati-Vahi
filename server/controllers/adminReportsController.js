const Report = require('../models/Report');
const ModerationLog = require('../models/ModerationLog');

// @desc   Get reports with filters
// @route  GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const { status, targetType, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// @desc   Update report status
// @route  PATCH /api/admin/reports/:id
const updateReport = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    report.reviewedBy = req.admin._id;
    report.reviewNote = reviewNote || '';
    report.reviewedAt = new Date();
    await report.save();

    let action;
    if (status === 'reviewed') action = 'report_reviewed';
    else if (status === 'resolved') action = 'report_resolved';
    else action = 'report_dismissed';

    await ModerationLog.create({
      admin: req.admin._id,
      action,
      targetType: 'report',
      targetId: report._id,
      targetLabel: `Report on ${report.targetType} (${report.reason})`,
    });

    res.json({ message: `Report marked as ${status}` });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

// @desc   Submit a report (user-facing)
// @route  POST /api/reports
const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'targetType, targetId, and reason are required' });
    }

    if (!['book', 'entry', 'user'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    // Prevent duplicate pending reports by same user
    const existing = await Report.findOne({
      reporter: req.user._id,
      targetId,
      targetType,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reported this item.' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description?.trim() || '',
    });

    res.status(201).json({ message: 'Report submitted. Thank you for keeping the community safe.' });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

module.exports = { getReports, updateReport, submitReport };
