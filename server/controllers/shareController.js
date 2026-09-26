const crypto = require('crypto');
const Book = require('../models/Book');
const Entry = require('../models/Entry');

// @desc    Toggle link sharing for a book (owner only)
// @route   POST /api/share/:bookId/toggle
const toggleShare = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { enable } = req.body;
    const shouldEnable = enable === true || enable === 'true';

    if (shouldEnable) {
      // Generate a shareId if one doesn't already exist
      if (!book.shareId) {
        book.shareId = crypto.randomBytes(16).toString('hex');
      }
      book.isShareEnabled = true;
    } else {
      book.isShareEnabled = false;
      // Keep the shareId so re-enabling restores the same link
    }

    await book.save();

    res.json({
      shareId: book.shareId,
      isShareEnabled: book.isShareEnabled,
      isPublic: book.isPublic,
    });
  } catch (error) {
    console.error('Toggle share error:', error);
    res.status(500).json({ message: 'Failed to update sharing settings' });
  }
};

// @desc    Get share info for a book (owner only)
// @route   GET /api/share/:bookId/info
const getShareInfo = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      shareId: book.shareId,
      isShareEnabled: book.isShareEnabled,
      isPublic: book.isPublic,
    });
  } catch (error) {
    console.error('Get share info error:', error);
    res.status(500).json({ message: 'Failed to fetch sharing info' });
  }
};

// @desc    Get a shared book by shareId (public, read-only)
// @route   GET /api/share/view/:shareId
const getSharedBook = async (req, res) => {
  try {
    const book = await Book.findOne({ shareId: req.params.shareId }).populate(
      'owner',
      'name'
    );

    if (!book) {
      return res.status(404).json({ message: 'Shared book not found' });
    }

    // Allow access if book is public OR if link sharing is enabled
    if (!book.isPublic && !book.isShareEnabled) {
      return res
        .status(403)
        .json({ message: 'This book is no longer shared' });
    }

    const entries = await Entry.find({ book: book._id }).sort({
      createdAt: -1,
    });

    // Return only safe, read-only data
    res.json({
      book: {
        _id: book._id,
        title: book.title,
        description: book.description,
        coverImage: book.coverImage,
        isPublic: book.isPublic,
        ownerName: book.owner?.name || 'Unknown',
        createdAt: book.createdAt,
      },
      entries: entries.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        imageUrl: e.imageUrl,
        videoUrl: e.videoUrl,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get shared book error:', error);
    res.status(500).json({ message: 'Failed to load shared book' });
  }
};

module.exports = { toggleShare, getShareInfo, getSharedBook };
