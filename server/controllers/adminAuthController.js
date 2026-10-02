const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate admin-specific JWT (uses adminId not id, different secret)
const generateAdminToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
};

// Initialize the first Super Admin from env variables (idempotent)
const initSuperAdmin = async () => {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!email || !password) return;

    const exists = await Admin.findOne({ email });
    if (exists) return;

    await Admin.create({ name, email, password, role: 'superadmin' });
    console.log('✅ Super Admin initialized:', email);
  } catch (err) {
    console.error('Super Admin initialization error:', err.message);
  }
};

// @desc   Admin login
// @route  POST /api/admin/auth/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (admin.status === 'suspended') {
      return res.status(403).json({ message: 'Your admin account has been suspended.' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// @desc   Get current admin profile
// @route  GET /api/admin/auth/me
const getAdminProfile = async (req, res) => {
  try {
    res.json({
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      status: req.admin.status,
      createdAt: req.admin.createdAt,
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { adminLogin, getAdminProfile, initSuperAdmin };
