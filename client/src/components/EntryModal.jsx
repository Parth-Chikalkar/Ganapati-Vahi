import React, { useState, useEffect } from 'react';
import {
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineVideoCamera,
  HiOutlineCalendar,
  HiOutlineArrowsExpand,
  HiOutlineExternalLink,
  HiOutlinePlay,
} from 'react-icons/hi';

const getEmbedVideoUrl = (url) => {
  if (!url) return null;
  // YouTube standard or short links
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0` };
  }
  // Direct video file or Cloudinary video
  if (
    url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ||
    (url.includes('cloudinary.com') && url.includes('/video/upload/'))
  ) {
    return { type: 'video', embedUrl: url };
  }
  // Generic external link
  return { type: 'link', embedUrl: url };
};

const EntryModal = ({
  entry,
  onClose,
  onEdit,
  onDelete,
  isOwner,
  onNext,
  onPrev,
  currentIndex,
  totalEntries,
}) => {
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  // Keyboard navigation & escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreenImage) {
          setIsFullscreenImage(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && onPrev && !isFullscreenImage) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext && !isFullscreenImage) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNext, onPrev, isFullscreenImage]);

  if (!entry) return null;

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const videoData = getEmbedVideoUrl(entry.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-maroon-dark/80 backdrop-blur-md animate-fade-in">
      {/* Background overlay click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal background"
      />

      {/* Main Modal Card */}
      <div className="relative z-10 bg-paper border-2 border-gold rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row overflow-hidden animate-modal-pop">
        
        {/* Decorative Tape Accent on top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-tape/90 rounded-b shadow-sm z-30 pointer-events-none hidden sm:block border-x border-b border-paper-aged/50" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-40 bg-maroon text-gold p-2 rounded-full hover:bg-maroon-dark hover:scale-110 transition-all shadow-md border border-gold/60 cursor-pointer"
          title="Close (Esc)"
        >
          <HiX className="text-xl" />
        </button>

        {/* Previous Navigation Button (Desktop Floating on left) */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-paper/90 text-maroon hover:bg-maroon hover:text-gold p-2.5 rounded-full border border-gold shadow-lg transition-all hidden md:flex items-center justify-center cursor-pointer hover:scale-110"
            title="Previous entry (Left Arrow)"
          >
            <HiChevronLeft className="text-2xl" />
          </button>
        )}

        {/* Next Navigation Button (Desktop Floating on right) */}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-14 top-1/2 -translate-y-1/2 z-40 bg-paper/90 text-maroon hover:bg-maroon hover:text-gold p-2.5 rounded-full border border-gold shadow-lg transition-all hidden md:flex items-center justify-center cursor-pointer hover:scale-110"
            title="Next entry (Right Arrow)"
          >
            <HiChevronRight className="text-2xl" />
          </button>
        )}

        {/* LEFT COLUMN: Image Display Area */}
        <div className="relative md:w-3/5 bg-maroon-dark/95 flex items-center justify-center min-h-[260px] sm:min-h-[340px] md:min-h-[500px] max-h-[45vh] md:max-h-[92vh] overflow-hidden group">
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="w-full h-full object-contain max-h-[45vh] md:max-h-[88vh] transition-transform duration-300"
          />

          {/* Hover overlay hint to expand image */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <button
              onClick={() => setIsFullscreenImage(true)}
              className="pointer-events-auto bg-maroon/90 text-gold font-subheading px-4 py-2 rounded-full border border-gold shadow-lg flex items-center gap-2 hover:bg-maroon transition-all cursor-pointer transform hover:scale-105"
            >
              <HiOutlineArrowsExpand className="text-lg" /> Full Image View
            </button>
          </div>

          {/* Bottom left badge on image */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-paper text-xs px-3 py-1 rounded-full border border-gold/40 flex items-center gap-1.5 pointer-events-none">
            <HiOutlineCalendar className="text-gold text-sm" />
            <span>{formattedDate}</span>
          </div>

          {/* Expand Image Button on top left */}
          <button
            onClick={() => setIsFullscreenImage(true)}
            className="absolute top-3 left-3 bg-black/60 text-gold hover:bg-maroon hover:text-white p-2 rounded-full border border-gold/40 transition-colors cursor-pointer"
            title="Expand Fullscreen Image"
          >
            <HiOutlineArrowsExpand className="text-lg" />
          </button>
        </div>

        {/* RIGHT COLUMN: Details & Meta Content Area */}
        <div className="md:w-2/5 p-5 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[47vh] md:max-h-[92vh] bg-paper">
          
          {/* Top Info Bar: Index indicator */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              {currentIndex !== undefined && totalEntries !== undefined && (
                <span className="text-xs font-subheading text-gold-dark bg-paper-dark border border-gold/40 px-2.5 py-0.5 rounded-full">
                  Entry {currentIndex + 1} of {totalEntries}
                </span>
              )}
              <span className="text-xs text-ink-muted font-subheading flex items-center gap-1 ml-auto">
                <HiOutlineCalendar className="text-maroon text-sm" />
                {formattedDate}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-heading text-3xl sm:text-4xl text-maroon mb-4 leading-tight border-b border-paper-aged pb-3">
              {entry.title}
            </h2>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-subheading text-sm text-ink-light uppercase tracking-wider mb-2">
                Description / स्मरण (Notes)
              </h4>
              {entry.description ? (
                <p className="text-ink font-body text-base leading-relaxed whitespace-pre-wrap bg-paper-dark/40 p-4 rounded-lg border border-paper-aged/60 shadow-inner">
                  {entry.description}
                </p>
              ) : (
                <p className="text-ink-muted font-body italic text-sm bg-paper-dark/30 p-4 rounded-lg border border-dashed border-paper-aged/60">
                  No notes recorded for this entry.
                </p>
              )}
            </div>

            {/* Video Section (if present) */}
            {entry.videoUrl && videoData && (
              <div className="mb-6">
                <h4 className="font-subheading text-sm text-maroon uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HiOutlineVideoCamera className="text-lg text-maroon" />
                  Video Memory
                </h4>

                {videoData.type === 'youtube' && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gold shadow-md bg-black">
                    <iframe
                      src={videoData.embedUrl}
                      title={entry.title}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {videoData.type === 'video' && (
                  <div className="relative w-full rounded-lg overflow-hidden border border-gold shadow-md bg-black">
                    <video
                      controls
                      src={videoData.embedUrl}
                      className="w-full max-h-56 object-contain"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                )}

                {videoData.type === 'link' && (
                  <a
                    href={entry.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-maroon/10 hover:bg-maroon/20 border border-maroon text-maroon font-subheading transition-colors no-underline group"
                  >
                    <span className="flex items-center gap-2">
                      <HiOutlinePlay className="text-xl text-maroon group-hover:scale-110 transition-transform" />
                      Watch Video Link
                    </span>
                    <HiOutlineExternalLink className="text-lg" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions & Controls */}
          <div className="pt-4 border-t border-paper-aged flex flex-col gap-3">
            {/* Mobile Navigation controls */}
            {(onPrev || onNext) && (
              <div className="flex items-center justify-between md:hidden gap-2 pb-2">
                <button
                  onClick={onPrev}
                  disabled={!onPrev}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HiChevronLeft /> Previous
                </button>
                <button
                  onClick={onNext}
                  disabled={!onNext}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <HiChevronRight />
                </button>
              </div>
            )}

            {/* Owner controls: Edit / Delete */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsFullscreenImage(true)}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 no-underline cursor-pointer"
              >
                <HiOutlineArrowsExpand /> Full View
              </button>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(entry._id);
                    }}
                    className="flex items-center gap-1 bg-maroon/10 hover:bg-maroon hover:text-gold text-maroon px-3 py-2 rounded text-xs sm:text-sm font-subheading border border-maroon transition-colors cursor-pointer"
                  >
                    <HiOutlinePencil /> Edit
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onDelete(entry._id);
                    }}
                    className="flex items-center gap-1 bg-red-50 hover:bg-red-700 hover:text-white text-red-700 px-3 py-2 rounded text-xs sm:text-sm font-subheading border border-red-300 transition-colors cursor-pointer"
                  >
                    <HiOutlineTrash /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Res Image Lightbox Modal */}
      {isFullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsFullscreenImage(false)}
        >
          <button
            onClick={() => setIsFullscreenImage(false)}
            className="absolute top-4 right-4 z-50 bg-maroon text-gold p-3 rounded-full hover:bg-maroon-dark hover:scale-110 transition-all border border-gold cursor-pointer"
            title="Close Full View"
          >
            <HiX className="text-2xl" />
          </button>
          
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
            <img
              src={entry.imageUrl}
              alt={entry.title}
              className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border border-gold/30"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-paper">
              <h3 className="font-heading text-2xl text-gold">{entry.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryModal;
