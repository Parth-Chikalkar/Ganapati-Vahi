const Book = require('../models/Book');
const Entry = require('../models/Entry');
const ModerationLog = require('../models/ModerationLog');

// @desc   Get all books with owner and entry count
// @route  GET /api/admin/content/books
const getBooks = async (req, res) => {
  try {
    const { search, visibility, page = 1, limit = 20 } = req.query;

    const query = {};
    if (visibility === 'public') query.isPublic = true;
    if (visibility === 'private') query.isPublic = false;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const booksWithCounts = await Promise.all(
      books.map(async (b) => {
        const entryCount = await Entry.countDocuments({ book: b._id });
        return { ...b.toObject(), entryCount };
      })
    );

    res.json({ books: booksWithCounts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

// @desc   Get entries for a specific book (for preview)
// @route  GET /api/admin/content/books/:id/entries
const getBookEntries = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name email');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const entries = await Entry.find({ book: req.params.id }).sort({ createdAt: -1 });
    res.json({ book, entries });
  } catch (error) {
    console.error('Get book entries error:', error);
    res.status(500).json({ message: 'Failed to fetch book entries' });
  }
};

// @desc   Delete a book and all its entries
// @route  DELETE /api/admin/content/books/:id
const deleteBook = async (req, res) => {
  try {
    const { reason } = req.body;
    const cloudinary = require('../config/cloudinary');

    const book = await Book.findById(req.params.id).populate('owner', 'name email');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Delete all entry assets from Cloudinary
    const entries = await Entry.find({ book: book._id });
    for (const entry of entries) {
      try {
        if (entry.imagePublicId) await cloudinary.uploader.destroy(entry.imagePublicId);
        if (entry.videoPublicId) await cloudinary.uploader.destroy(entry.videoPublicId, { resource_type: 'video' });
      } catch (e) { /* ignore */ }
    }

    if (book.coverImagePublicId) {
      try { await cloudinary.uploader.destroy(book.coverImagePublicId); } catch (e) { /* ignore */ }
    }

    await ModerationLog.create({
      admin: req.admin._id,
      action: 'book_deleted',
      targetType: 'book',
      targetId: book._id,
      targetLabel: `"${book.title}" by ${book.owner?.name || 'Unknown'}`,
      reason: reason || '',
    });

    await Entry.deleteMany({ book: book._id });
    await Book.findByIdAndDelete(book._id);

    res.json({ message: 'Book and all entries deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
};

// @desc   Get all entries
// @route  GET /api/admin/content/entries
const getEntries = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await Entry.countDocuments(query);
    const entries = await Entry.find(query)
      .populate('owner', 'name email')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ entries, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ message: 'Failed to fetch entries' });
  }
};

// @desc   Delete a single entry
// @route  DELETE /api/admin/content/entries/:id
const deleteEntry = async (req, res) => {
  try {
    const { reason } = req.body;
    const cloudinary = require('../config/cloudinary');

    const entry = await Entry.findById(req.params.id).populate('owner', 'name email');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    try {
      if (entry.imagePublicId) await cloudinary.uploader.destroy(entry.imagePublicId);
      if (entry.videoPublicId) await cloudinary.uploader.destroy(entry.videoPublicId, { resource_type: 'video' });
    } catch (e) { /* ignore */ }

    await ModerationLog.create({
      admin: req.admin._id,
      action: 'entry_deleted',
      targetType: 'entry',
      targetId: entry._id,
      targetLabel: `"${entry.title}" by ${entry.owner?.name || 'Unknown'}`,
      reason: reason || '',
    });

    await Entry.findByIdAndDelete(entry._id);

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ message: 'Failed to delete entry' });
  }
};

module.exports = { getBooks, getBookEntries, getEntries, deleteBook, deleteEntry };
