const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Entry title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Ganapati image is required'],
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoPublicId: {
      type: String,
      default: '',
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Entry', entrySchema);
