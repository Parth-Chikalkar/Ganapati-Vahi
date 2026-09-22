const fs = require('fs');
const Entry = require('../models/Entry');
const Book = require('../models/Book');
const cloudinary = require('../config/cloudinary');

// @desc    Add an entry to a book
// @route   POST /api/entries/:bookId
const addEntry = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, description } = req.body;

    // Verify book exists and user owns it
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add entries to this book' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Entry title is required' });
    }

    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({ message: 'Ganapati image is required' });
    }

    // Upload image to Cloudinary
    const imageFile = req.files.image[0];
    const imageResult = await cloudinary.uploader.upload(imageFile.path, {
      folder: 'ganapati-vahi/entries',
      resource_type: 'image',
    });

    // Clean up local temp file
    fs.unlinkSync(imageFile.path);

    let videoUrl = '';
    let videoPublicId = '';

    // Upload video if provided
    if (req.files.video && req.files.video.length > 0) {
      const videoFile = req.files.video[0];
      const videoResult = await cloudinary.uploader.upload(videoFile.path, {
        folder: 'ganapati-vahi/entries',
        resource_type: 'video',
      });
      fs.unlinkSync(videoFile.path);
      videoUrl = videoResult.secure_url;
      videoPublicId = videoResult.public_id;
    }

    const entry = await Entry.create({
      title: title.trim(),
      description: description?.trim() || '',
      imageUrl: imageResult.secure_url,
      imagePublicId: imageResult.public_id,
      videoUrl,
      videoPublicId,
      book: bookId,
      owner: req.user._id,
    });

    res.status(201).json(entry);
  } catch (error) {
    // Clean up any uploaded temp files on error
    if (req.files) {
      Object.values(req.files).flat().forEach((file) => {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      });
    }
    console.error('Add entry error:', error);
    res.status(500).json({ message: 'Failed to add entry' });
  }
};

// @desc    Get all entries for a book
// @route   GET /api/entries/:bookId
const getEntriesByBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // If private, check ownership
    if (!book.isPublic) {
      if (!req.user || req.user._id.toString() !== book.owner.toString()) {
        return res.status(403).json({ message: 'This book is private' });
      }
    }

    const entries = await Entry.find({ book: bookId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ message: 'Failed to fetch entries' });
  }
};

// @desc    Get a single entry by ID
// @route   GET /api/entries/single/:id
const getEntryById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ message: 'Failed to fetch entry' });
  }
};

// @desc    Update an entry
// @route   PUT /api/entries/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    if (entry.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this entry' });
    }

    const { title, description } = req.body;

    if (title !== undefined) entry.title = title.trim();
    if (description !== undefined) entry.description = description.trim();

    // Replace image if new one uploaded
    if (req.files && req.files.image && req.files.image.length > 0) {
      // Delete old image from Cloudinary
      try {
        await cloudinary.uploader.destroy(entry.imagePublicId);
      } catch (e) { /* ignore */ }

      const imageFile = req.files.image[0];
      const imageResult = await cloudinary.uploader.upload(imageFile.path, {
        folder: 'ganapati-vahi/entries',
        resource_type: 'image',
      });
      fs.unlinkSync(imageFile.path);

      entry.imageUrl = imageResult.secure_url;
      entry.imagePublicId = imageResult.public_id;
    }

    // Replace video if new one uploaded
    if (req.files && req.files.video && req.files.video.length > 0) {
      // Delete old video from Cloudinary
      if (entry.videoPublicId) {
        try {
          await cloudinary.uploader.destroy(entry.videoPublicId, { resource_type: 'video' });
        } catch (e) { /* ignore */ }
      }

      const videoFile = req.files.video[0];
      const videoResult = await cloudinary.uploader.upload(videoFile.path, {
        folder: 'ganapati-vahi/entries',
        resource_type: 'video',
      });
      fs.unlinkSync(videoFile.path);

      entry.videoUrl = videoResult.secure_url;
      entry.videoPublicId = videoResult.public_id;
    }

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    if (req.files) {
      Object.values(req.files).flat().forEach((file) => {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      });
    }
    console.error('Update entry error:', error);
    res.status(500).json({ message: 'Failed to update entry' });
  }
};

// @desc    Delete an entry
// @route   DELETE /api/entries/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    if (entry.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(entry.imagePublicId);
    } catch (e) { /* ignore */ }

    if (entry.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(entry.videoPublicId, { resource_type: 'video' });
      } catch (e) { /* ignore */ }
    }

    await Entry.findByIdAndDelete(entry._id);

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ message: 'Failed to delete entry' });
  }
};

module.exports = { addEntry, getEntriesByBook, getEntryById, updateEntry, deleteEntry };
