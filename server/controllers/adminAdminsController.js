const Admin = require('../models/Admin');
const ModerationLog = require('../models/ModerationLog');

// @desc   Get all admins (superadmin only)
// @route  GET /api/admin/admins
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Failed to fetch admins' });
  }
};

// @desc   Create a new admin (superadmin only)
// @route  POST /api/admin/admins
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Prevent creating another superadmin
    if (role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot create superadmin accounts' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An admin with this email already exists' });
    }

    const admin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'admin',
      createdBy: req.admin._id,
    });

    await ModerationLog.create({
      admin: req.admin._id,
      action: 'admin_created',
      targetType: 'admin',
      targetId: admin._id,
      targetLabel: `${admin.name} (${admin.email})`,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Failed to create admin' });
  }
};

// @desc   Update admin status (superadmin only)
// @route  PATCH /api/admin/admins/:id/status
const updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const target = await Admin.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent superadmin from being modified
    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify a Super Admin account' });
    }

    // Prevent self-modification
    if (target._id.toString() === req.admin._id.toString()) {
      return res.status(403).json({ message: 'Cannot modify your own account status' });
    }

    target.status = status;
    await target.save();

    await ModerationLog.create({
      admin: req.admin._id,
      action: status === 'suspended' ? 'admin_suspended' : 'admin_unsuspended',
      targetType: 'admin',
      targetId: target._id,
      targetLabel: `${target.name} (${target.email})`,
      reason: req.body.reason || '',
    });

    res.json({ message: `Admin ${status === 'suspended' ? 'suspended' : 'unsuspended'} successfully` });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ message: 'Failed to update admin status' });
  }
};

// @desc   Delete an admin (superadmin only)
// @route  DELETE /api/admin/admins/:id
const deleteAdmin = async (req, res) => {
  try {
    const target = await Admin.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete a Super Admin account' });
    }

    if (target._id.toString() === req.admin._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    await ModerationLog.create({
      admin: req.admin._id,
      action: 'admin_deleted',
      targetType: 'admin',
      targetId: target._id,
      targetLabel: `${target.name} (${target.email})`,
      reason: req.body.reason || '',
    });

    await Admin.findByIdAndDelete(req.params.id);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Failed to delete admin' });
  }
};

module.exports = { getAdmins, createAdmin, updateAdminStatus, deleteAdmin };
