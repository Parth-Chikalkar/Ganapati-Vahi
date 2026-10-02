const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verify admin JWT and attach admin to req.admin
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no admin token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    // Ensure the token was issued for an admin (has adminId, not id)
    if (!decoded.adminId) {
      return res.status(401).json({ message: 'Not authorized, invalid admin token' });
    }

    const admin = await Admin.findById(decoded.adminId).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Not authorized, admin not found' });
    }

    if (admin.status === 'suspended') {
      return res.status(403).json({ message: 'Your admin account has been suspended.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid admin token' });
  }
};

// Only allow superadmin role
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Super Admin only.' });
  }
  next();
};

module.exports = { adminAuth, requireSuperAdmin };
