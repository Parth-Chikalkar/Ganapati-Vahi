import { useState } from 'react';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineVideoCamera,
  HiOutlineArrowsExpand,
} from 'react-icons/hi';
import EntryModal from './EntryModal';

const EntryCard = ({ entry, isOwner, onEdit, onDelete, onClick }) => {
  const [showInternalModal, setShowInternalModal] = useState(false);

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleCardClick = () => {
    if (onClick) {
      onClick(entry);
    } else {
      setShowInternalModal(true);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="polaroid cursor-pointer group hover:shadow-xl transition-all duration-300"
        title="Click to view full image and details"
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-sm bg-maroon-dark/10">
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Hover zoom overlay indicator */}
          <div className="absolute inset-0 bg-maroon-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-paper/90 text-maroon text-xs font-subheading px-3 py-1.5 rounded-full border border-gold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <HiOutlineArrowsExpand className="text-sm" /> Click to Expand
            </span>
          </div>

          {entry.videoUrl && (
            <a
              href={entry.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 z-10 bg-maroon/80 text-gold p-1.5 rounded-full hover:bg-maroon hover:scale-110 transition-all no-underline border border-gold"
              title="Watch video"
            >
              <HiOutlineVideoCamera className="text-lg" />
            </a>
          )}
        </div>

        {/* Caption area — polaroid style */}
        <div className="pt-4 px-1">
          <h4 className="font-heading text-2xl text-maroon mb-1 group-hover:text-maroon-dark transition-colors">
            {entry.title}
          </h4>
          {entry.description && (
            <p className="text-ink text-sm mb-3 font-body line-clamp-3">
              {entry.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-light font-subheading">
              {formattedDate}
            </span>

            {isOwner && (
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(entry._id);
                  }}
                  className="text-ink-light hover:text-maroon transition-colors bg-transparent border-none cursor-pointer p-1"
                  title="Edit entry"
                >
                  <HiOutlinePencil className="text-lg" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry._id);
                  }}
                  className="text-ink-light hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-1"
                  title="Delete entry"
                >
                  <HiOutlineTrash className="text-lg" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Internal Modal fallback if parent component doesn't manage modal state */}
      {!onClick && showInternalModal && (
        <EntryModal
          entry={entry}
          onClose={() => setShowInternalModal(false)}
          onEdit={onEdit}
          onDelete={onDelete}
          isOwner={isOwner}
        />
      )}
    </>
  );
};

export default EntryCard;
