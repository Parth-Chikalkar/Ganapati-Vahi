const User = require('../models/User');
const Book = require('../models/Book');
const Entry = require('../models/Entry');
const ModerationLog = require('../models/ModerationLog');

// @desc   Get all users with stats
// @route  GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach book count
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookCount = await Book.countDocuments({ owner: u._id });
        return { ...u.toObject(), bookCount };
      })
    );

    res.json({ users: usersWithStats, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc   Get a single user
// @route  GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bookCount = await Book.countDocuments({ owner: user._id });
    const entryCount = await Entry.countDocuments({ owner: user._id });

    res.json({ ...user.toObject(), bookCount, entryCount });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// @desc   Update user status (suspend/block/unblock)
// @route  PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prevStatus = user.status;
    user.status = status;
    await user.save();

    let action;
    if (status === 'suspended') action = 'user_suspended';
    else if (status === 'blocked') action = 'user_blocked';
    else action = 'user_unblocked';

    await ModerationLog.create({
      admin: req.admin._id,
      action,
      targetType: 'user',
      targetId: user._id,
      targetLabel: `${user.name} (${user.email})`,
      reason: reason || '',
    });

    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

// @desc   Delete a user and all their content (superadmin only)
// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const cloudinary = require('../config/cloudinary');

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete all entries' Cloudinary assets
    const entries = await Entry.find({ owner: user._id });
    for (const entry of entries) {
      try {
        if (entry.imagePublicId) await cloudinary.uploader.destroy(entry.imagePublicId);
        if (entry.videoPublicId) await cloudinary.uploader.destroy(entry.videoPublicId, { resource_type: 'video' });
      } catch (e) { /* ignore cloudinary errors */ }
    }

    // Delete book cover images
    const books = await Book.find({ owner: user._id });
    for (const book of books) {
      try {
        if (book.coverImagePublicId) await cloudinary.uploader.destroy(book.coverImagePublicId);
      } catch (e) { /* ignore */ }
    }

    // Log before deleting
    await ModerationLog.create({
      admin: req.admin._id,
      action: 'user_deleted',
      targetType: 'user',
      targetId: user._id,
      targetLabel: `${user.name} (${user.email})`,
      reason: reason || '',
    });

    // Cascade delete
    await Entry.deleteMany({ owner: user._id });
    await Book.deleteMany({ owner: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User and all their content deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = { getUsers, getUserById, updateUserStatus, deleteUser };
