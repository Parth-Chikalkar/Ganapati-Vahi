import { HiOutlinePencil, HiOutlineTrash, HiOutlineVideoCamera } from 'react-icons/hi';

const EntryCard = ({ entry, isOwner, onEdit, onDelete }) => {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="polaroid">
      {/* Image */}
      <div className="relative overflow-hidden rounded-sm">
        <img
          src={entry.imageUrl}
          alt={entry.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        {entry.videoUrl && (
          <a
            href={entry.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-maroon/80 text-gold p-1.5 rounded-full hover:bg-maroon transition-colors no-underline border border-gold"
            title="Watch video"
          >
            <HiOutlineVideoCamera className="text-lg" />
          </a>
        )}
      </div>

      {/* Caption area — polaroid style */}
      <div className="pt-4 px-1">
        <h4 className="font-heading text-2xl text-maroon mb-1">
          {entry.title}
        </h4>
        {entry.description && (
          <p className="text-ink text-sm mb-3 font-body line-clamp-3">
            {entry.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-light font-subheading text-base">
            {formattedDate}
          </span>

          {isOwner && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(entry._id)}
                className="text-ink-light hover:text-maroon transition-colors bg-transparent border-none cursor-pointer p-1"
                title="Edit entry"
              >
                <HiOutlinePencil className="text-lg" />
              </button>
              <button
                onClick={() => onDelete(entry._id)}
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
  );
};

export default EntryCard;
