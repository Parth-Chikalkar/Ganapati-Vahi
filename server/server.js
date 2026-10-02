const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const entryRoutes = require('./routes/entries');
const shareRoutes = require('./routes/share');

// Admin routes
const adminAuthRoutes = require('./routes/adminAuth');
const adminAdminsRoutes = require('./routes/adminAdmins');
const adminUsersRoutes = require('./routes/adminUsers');
const adminContentRoutes = require('./routes/adminContent');
const adminReportsRoutes = require('./routes/adminReports');
const adminStatsRoutes = require('./routes/adminStats');
const adminLogsRoutes = require('./routes/adminLogs');

const { initSuperAdmin } = require('./controllers/adminAuthController');

const app = express();

// Connect to MongoDB then initialize super admin
connectDB().then(() => {
  initSuperAdmin();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// User Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/reports', require('./routes/reports')); // user-facing report submission

// Admin Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/admins', adminAdminsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/admin/reports', adminReportsRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/logs', adminLogsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ganapati Vahi server is running 🙏' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

