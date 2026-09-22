const express = require('express');
const { body } = require('express-validator');
const { signup, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  signup
);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', auth, getProfile);

module.exports = router;
