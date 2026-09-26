const express = require('express');
const {
  toggleShare,
  getShareInfo,
  getSharedBook,
} = require('../controllers/shareController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public route — view a shared book by shareId
router.get('/view/:shareId', getSharedBook);

// Protected routes — owner manages sharing
router.get('/:bookId/info', auth, getShareInfo);
router.post('/:bookId/toggle', auth, toggleShare);

module.exports = router;
