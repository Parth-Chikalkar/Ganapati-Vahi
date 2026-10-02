const User = require('../models/User');
const Book = require('../models/Book');
const Entry = require('../models/Entry');
const Report = require('../models/Report');

// @desc   Get dashboard statistics
// @route  GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      blockedUsers,
      totalBooks,
      publicBooks,
      privateBooks,
      totalEntries,
      entriesWithVideo,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ status: 'blocked' }),
      Book.countDocuments(),
      Book.countDocuments({ isPublic: true }),
      Book.countDocuments({ isPublic: false }),
      Entry.countDocuments(),
      Entry.countDocuments({ videoUrl: { $ne: '' } }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // New users over the last 7 days (daily)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const newUsersChart = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const newBooksChart = await Book.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const newEntriesChart = await Entry.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const reportsChart = await Report.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        blockedUsers,
        totalBooks,
        publicBooks,
        privateBooks,
        totalEntries,
        totalMedia: entriesWithVideo,
        pendingReports,
      },
      charts: {
        newUsers: newUsersChart,
        newBooks: newBooksChart,
        newEntries: newEntriesChart,
        reports: reportsChart,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

module.exports = { getStats };
