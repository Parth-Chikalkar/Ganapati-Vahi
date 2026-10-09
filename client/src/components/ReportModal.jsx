import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { HiX, HiOutlineFlag, HiOutlineLockClosed } from 'react-icons/hi';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam',                  label: 'Spam'                  },
  { value: 'harassment',            label: 'Harassment'            },
  { value: 'misinformation',        label: 'Misinformation'        },
  { value: 'copyright',             label: 'Copyright Violation'   },
  { value: 'other',                 label: 'Other'                 },
];

/**
 * ReportModal
 * @param {string}   targetType  – 'book' | 'entry' | 'user'
 * @param {string}   targetId    – MongoDB ObjectId of the target
 * @param {string}   targetLabel – Human-readable name shown in the header
 * @param {function} onClose     – called when the modal should close
 */
const ReportModal = ({ targetType, targetId, targetLabel, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { toast.error('Please select a reason.'); return; }
    if (!user)   { toast.error('You must be logged in to report.'); return; }

    setSubmitting(true);
    try {
      await API.post('/reports', { targetType, targetId, reason, description });
      toast.success('Report submitted. Thank you for keeping the community safe.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    const unauthModal = (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-maroon-dark/80 backdrop-blur-sm animate-fade-in">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10 bg-paper border-2 border-gold rounded-2xl shadow-2xl w-full max-w-md animate-modal-pop p-6 pt-8 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-tape/90 rounded-b shadow-sm pointer-events-none border-x border-b border-paper-aged/50" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-maroon text-gold p-1.5 rounded-full hover:bg-maroon-dark hover:scale-110 transition-all border border-gold/60 cursor-pointer"
            title="Close"
          >
            <HiX className="text-lg" />
          </button>
          <div className="mx-auto w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center border border-red-200 mb-4 shadow-inner">
            <HiOutlineLockClosed className="text-2xl" />
          </div>
          <h2 className="font-heading text-2xl text-maroon mb-2">Login Required</h2>
          <p className="text-sm text-ink-muted mb-6 font-body">
            You must be logged in to report content. Please sign in to your account to continue.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary text-sm py-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="flex-1 btn-primary text-sm py-2 cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
    return createPortal(unauthModal, document.body);
  }

  const modal = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-maroon-dark/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-paper border-2 border-gold rounded-2xl shadow-2xl w-full max-w-md animate-modal-pop">
        {/* Decorative tape */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-tape/90 rounded-b shadow-sm pointer-events-none border-x border-b border-paper-aged/50" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-maroon text-gold p-1.5 rounded-full hover:bg-maroon-dark hover:scale-110 transition-all border border-gold/60 cursor-pointer"
          title="Close"
        >
          <HiX className="text-lg" />
        </button>

        <div className="p-6 pt-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-red-100 text-red-700 p-2.5 rounded-full border border-red-200">
              <HiOutlineFlag className="text-xl" />
            </span>
            <div>
              <h2 className="font-heading text-2xl text-maroon leading-tight">Report</h2>
              {targetLabel && (
                <p className="text-xs text-ink-muted font-subheading mt-0.5 truncate max-w-xs">
                  {targetLabel}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason grid */}
            <div>
              <label className="block text-sm font-subheading text-ink-light uppercase tracking-wider mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`text-xs font-subheading px-3 py-2 rounded-lg border transition-all cursor-pointer text-left ${
                      reason === r.value
                        ? 'bg-maroon text-gold border-maroon shadow-sm'
                        : 'bg-paper-dark text-ink border-paper-aged hover:border-maroon hover:text-maroon'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional description */}
            <div>
              <label className="block text-sm font-subheading text-ink-light uppercase tracking-wider mb-2">
                Additional Details{' '}
                <span className="normal-case text-ink-muted">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Describe the issue in more detail…"
                className="w-full bg-paper-dark border border-paper-aged rounded-lg px-3 py-2 text-sm font-body text-ink placeholder-ink-muted focus:outline-none focus:border-maroon resize-none"
              />
              <p className="text-xs text-ink-muted text-right mt-1">{description.length}/1000</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary text-sm py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reason}
                className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-subheading text-sm py-2 px-4 rounded-lg border border-red-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <HiOutlineFlag />
                }
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ReportModal;
