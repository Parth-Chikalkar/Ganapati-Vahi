const express = require('express');
const { getBooks, getBookEntries, getEntries, deleteBook, deleteEntry } = require('../controllers/adminContentController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(adminAuth);

router.get('/books', getBooks);
router.get('/books/:id/entries', getBookEntries);
router.delete('/books/:id', deleteBook);

router.get('/entries', getEntries);
router.delete('/entries/:id', deleteEntry);

module.exports = router;
