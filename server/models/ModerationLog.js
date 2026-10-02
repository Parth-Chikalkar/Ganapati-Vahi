const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'admin_created',
        'admin_suspended',
        'admin_unsuspended',
        'admin_deleted',
        'user_suspended',
        'user_blocked',
        'user_unblocked',
        'user_deleted',
        'book_deleted',
        'entry_deleted',
        'report_reviewed',
        'report_resolved',
        'report_dismissed',
      ],
    },
    targetType: {
      type: String,
      enum: ['admin', 'user', 'book', 'entry', 'report'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetLabel: {
      // Human-readable description of target (name/email/title)
      type: String,
      default: '',
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
