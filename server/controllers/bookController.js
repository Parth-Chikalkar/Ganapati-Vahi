const fs = require('fs');
const Book = require('../models/Book');
const Entry = require('../models/Entry');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new book
// @route   POST /api/books
const createBook = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Book title is required' });
    }

    let coverImage = '';
    let coverImagePublicId = '';

    if (req.file) {
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ganapati-vahi/books',
        resource_type: 'image',
      });
      fs.unlinkSync(req.file.path);
      coverImage = imageResult.secure_url;
      coverImagePublicId = imageResult.public_id;
    }

    const book = await Book.create({
      title: title.trim(),
      description: description?.trim() || '',
      isPublic: isPublic === true || isPublic === 'true',
      owner: req.user._id,
      coverImage,
      coverImagePublicId,
    });

    res.status(201).json(book);
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Failed to create book' });
  }
};

// @desc    Get current user's books
// @route   GET /api/books/my
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id }).sort({ createdAt: -1 });

    // Get entry counts for each book
    const booksWithCounts = await Promise.all(
      books.map(async (book) => {
        const entryCount = await Entry.countDocuments({ book: book._id });
        // Get first entry image as cover if no cover set
        let coverImage = book.coverImage;
        if (!coverImage) {
          const firstEntry = await Entry.findOne({ book: book._id }).sort({ createdAt: 1 });
          coverImage = firstEntry?.imageUrl || '';
        }
        return { ...book.toObject(), entryCount, coverImage };
      })
    );

    res.json(booksWithCounts);
  } catch (error) {
    console.error('Get my books error:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

// @desc    Get all public books
// @route   GET /api/books/public
const getPublicBooks = async (req, res) => {
  try {
    const books = await Book.find({ isPublic: true })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    const booksWithCounts = await Promise.all(
      books.map(async (book) => {
        const entryCount = await Entry.countDocuments({ book: book._id });
        let coverImage = book.coverImage;
        if (!coverImage) {
          const firstEntry = await Entry.findOne({ book: book._id }).sort({ createdAt: 1 });
          coverImage = firstEntry?.imageUrl || '';
        }
        return { ...book.toObject(), entryCount, coverImage };
      })
    );

    res.json(booksWithCounts);
  } catch (error) {
    console.error('Get public books error:', error);
    res.status(500).json({ message: 'Failed to fetch public books' });
  }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // If private, only owner can view
    if (!book.isPublic) {
      if (!req.user || req.user._id.toString() !== book.owner._id.toString()) {
        return res.status(403).json({ message: 'This book is private' });
      }
    }

    const entryCount = await Entry.countDocuments({ book: book._id });

    res.json({ ...book.toObject(), entryCount });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this book' });
    }

    const { title, description, isPublic } = req.body;

    if (title !== undefined) book.title = title.trim();
    if (description !== undefined) book.description = description.trim();
    if (isPublic !== undefined) book.isPublic = isPublic === true || isPublic === 'true';

    if (req.file) {
      if (book.coverImagePublicId) {
        try {
          await cloudinary.uploader.destroy(book.coverImagePublicId);
        } catch (e) { /* ignore */ }
      }
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ganapati-vahi/books',
        resource_type: 'image',
      });
      fs.unlinkSync(req.file.path);
      book.coverImage = imageResult.secure_url;
      book.coverImagePublicId = imageResult.public_id;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Failed to update book' });
  }
};

// @desc    Delete a book and all its entries
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Delete all entries' Cloudinary assets
    const entries = await Entry.find({ book: book._id });
    for (const entry of entries) {
      try {
        if (entry.imagePublicId) {
          await cloudinary.uploader.destroy(entry.imagePublicId);
        }
        if (entry.videoPublicId) {
          await cloudinary.uploader.destroy(entry.videoPublicId, { resource_type: 'video' });
        }
      } catch (cloudErr) {
        console.error('Cloudinary cleanup error:', cloudErr.message);
      }
    }

    // Delete book's cover image if exists
    if (book.coverImagePublicId) {
      try {
        await cloudinary.uploader.destroy(book.coverImagePublicId);
      } catch (e) { /* ignore */ }
    }

    // Delete all entries and the book
    await Entry.deleteMany({ book: book._id });
    await Book.findByIdAndDelete(book._id);

    res.json({ message: 'Book and all entries deleted' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
};

module.exports = {
  createBook,
  getMyBooks,
  getPublicBooks,
  getBookById,
  updateBook,
  deleteBook,
};
