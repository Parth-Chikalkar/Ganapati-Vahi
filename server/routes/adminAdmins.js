const express = require('express');
const { getAdmins, createAdmin, updateAdminStatus, deleteAdmin } = require('../controllers/adminAdminsController');
const { adminAuth, requireSuperAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// All routes require admin auth + superadmin role
router.use(adminAuth, requireSuperAdmin);

router.get('/', getAdmins);
router.post('/', createAdmin);
router.patch('/:id/status', updateAdminStatus);
router.delete('/:id', deleteAdmin);

module.exports = router;
