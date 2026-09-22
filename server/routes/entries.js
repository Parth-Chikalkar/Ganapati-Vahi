const express = require('express');
const {
  addEntry,
  getEntriesByBook,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require('../controllers/entryController');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload fields: image (required), video (optional)
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// Get a single entry by ID (must be before /:bookId to avoid conflict)
router.get('/single/:id', auth, getEntryById);

// Add entry to a book (protected, with file upload)
router.post('/:bookId', auth, uploadFields, addEntry);

// Get entries for a book (conditional auth — public books visible to all)
router.get('/:bookId', optionalAuth, getEntriesByBook);

// Update an entry (protected, with optional file upload)
router.put('/:id', auth, uploadFields, updateEntry);

// Delete an entry (protected)
router.delete('/:id', auth, deleteEntry);

module.exports = router;
