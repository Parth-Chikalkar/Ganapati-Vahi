const express = require('express');
const {
  createBook,
  getMyBooks,
  getPublicBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/public', getPublicBooks);

// Protected routes
router.get('/my', auth, getMyBooks);
router.post('/', auth, upload.single('thumbnail'), upload.validateFileSizes, createBook);
router.put('/:id', auth, upload.single('thumbnail'), upload.validateFileSizes, updateBook);
router.delete('/:id', auth, deleteBook);

// Conditional auth — public books visible to all, private only to owner
router.get('/:id', optionalAuth, getBookById);

module.exports = router;
