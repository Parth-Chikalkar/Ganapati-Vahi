const express = require('express');
const { getUsers, getUserById, updateUserStatus, deleteUser } = require('../controllers/adminUsersController');
const { adminAuth, requireSuperAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// All routes require admin auth
router.use(adminAuth);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', updateUserStatus);

// Delete user — superadmin only
router.delete('/:id', requireSuperAdmin, deleteUser);

module.exports = router;
