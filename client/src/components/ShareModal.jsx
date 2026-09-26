import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  HiX,
  HiOutlineLink,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineShare,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed,
  HiOutlineEye,
} from 'react-icons/hi';

const ShareModal = ({ book, onClose }) => {
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchShareInfo = async () => {
      try {
        const res = await API.get(`/share/${book._id}/info`);
        setShareInfo(res.data);
      } catch (error) {
        console.error('Failed to fetch share info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShareInfo();
  }, [book._id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const shareUrl = shareInfo?.shareId
    ? `${window.location.origin}/shared/book/${shareInfo.shareId}`
    : '';

  const canShare = book.isPublic || shareInfo?.isShareEnabled;

  const handleToggleShare = async () => {
    setToggling(true);
    try {
      const res = await API.post(`/share/${book._id}/toggle`, {
        enable: !shareInfo.isShareEnabled,
      });
      setShareInfo(res.data);
    } catch (error) {
      console.error('Failed to toggle sharing:', error);
    } finally {
      setToggling(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.title} — Ganapati Vahi`,
          text: `Check out this Ganapati Vahi: ${book.title}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled the share dialog
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const coverSrc =
    book.coverImage ||
    (book.entries && book.entries[0]?.imageUrl) ||
    '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-dark/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="share-modal relative z-10 bg-paper border-2 border-gold rounded-xl shadow-2xl max-w-md w-full animate-modal-pop overflow-hidden">
        {/* Decorative top bar */}
        <div className="share-modal-header h-2 bg-gradient-to-r from-maroon via-saffron to-maroon" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-paper-dark text-ink-light p-1.5 rounded-full hover:bg-maroon hover:text-gold transition-all cursor-pointer border border-paper-aged"
          title="Close"
        >
          <HiX className="text-lg" />
        </button>

        <div className="p-6">
          {/* Header with mandala accent */}
          <div className="text-center mb-5">
            <div className="share-modal-icon inline-flex items-center justify-center w-12 h-12 rounded-full bg-saffron/20 border-2 border-saffron mb-3">
              <HiOutlineShare className="text-2xl text-maroon" />
            </div>
            <h3 className="font-heading text-2xl text-maroon">Share This Vahi</h3>
            <p className="text-sm text-ink-muted font-body mt-1">
              Share this beautiful Ganapati collection with others
            </p>
          </div>

          {/* Book preview */}
          <div className="flex items-center gap-3 p-3 bg-paper-dark rounded-lg border border-gold/40 mb-5">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                className="w-14 h-14 object-cover rounded border border-gold/60 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 bg-maroon/10 rounded border border-gold/60 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📖</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-lg text-maroon truncate leading-tight">
                {book.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                {book.isPublic ? (
                  <span className="flex items-center gap-1 text-xs text-gold-dark font-subheading">
                    <HiOutlineGlobeAlt className="text-xs" /> Public Book
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-ink-muted font-subheading">
                    <HiOutlineLockClosed className="text-xs" /> Private Book
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-ink-muted">Loading share settings...</p>
            </div>
          ) : (
            <>
              {/* Public book — always shareable */}
              {book.isPublic && (
                <div className="share-info-box p-3 bg-saffron/10 border border-saffron/30 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <HiOutlineGlobeAlt className="text-saffron text-lg flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-ink font-body">
                      This book is <strong>public</strong>. Anyone with the link can view it.
                    </p>
                  </div>
                </div>
              )}

              {/* Private book — toggle sharing */}
              {!book.isPublic && (
                <div className="share-toggle-section mb-4">
                  <div
                    className={`p-3 rounded-lg border transition-colors ${
                      shareInfo?.isShareEnabled
                        ? 'bg-saffron/10 border-saffron/30'
                        : 'bg-paper-dark border-paper-aged'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <HiOutlineEye className="text-lg flex-shrink-0 mt-0.5 text-ink-light" />
                        <div>
                          <p className="text-sm font-subheading text-ink">
                            Anyone with the link can view
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {shareInfo?.isShareEnabled
                              ? 'People with the share link can see this book'
                              : 'Only you can see this private book'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleShare}
                        disabled={toggling}
                        className={`relative inline-flex h-6 w-11 p-0 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          shareInfo?.isShareEnabled
                            ? 'bg-saffron'
                            : 'bg-ink-muted/30'
                        } ${toggling ? 'opacity-60' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            shareInfo?.isShareEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Share link section */}
              {canShare && shareUrl && (
                <div className="share-link-section">
                  {/* Link input + copy */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2 bg-paper-dark border border-gold/40 rounded-lg px-3 py-2.5 overflow-hidden">
                      <HiOutlineLink className="text-maroon flex-shrink-0" />
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-transparent border-none outline-none text-sm text-ink font-body truncate"
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-subheading text-sm transition-all cursor-pointer border ${
                        copied
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-maroon text-gold border-gold hover:bg-maroon-dark'
                      }`}
                    >
                      {copied ? (
                        <>
                          <HiOutlineCheck className="text-base" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboardCopy className="text-base" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Native share button */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-paper-dark border border-gold/40 text-ink font-subheading text-sm hover:bg-saffron/10 hover:border-saffron/40 transition-all cursor-pointer"
                    >
                      <HiOutlineShare className="text-base text-maroon" />
                      Share via...
                    </button>
                  )}
                </div>
              )}

              {/* Private book with sharing disabled — info message */}
              {!book.isPublic && !shareInfo?.isShareEnabled && (
                <div className="text-center py-2">
                  <p className="text-sm text-ink-muted font-body">
                    Enable link sharing above to generate a share link for this private book.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Decorative bottom */}
        <div className="share-modal-footer h-1.5 bg-gradient-to-r from-gold/40 via-saffron/60 to-gold/40" />
      </div>
    </div>
  );
};

export default ShareModal;
