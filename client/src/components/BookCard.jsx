import { Link } from 'react-router-dom';
import { HiOutlineBookOpen, HiOutlineLockClosed, HiOutlineGlobeAlt } from 'react-icons/hi';

const BookCard = ({ book, showOwner = false, onEdit, onDelete }) => {
  return (
    <div className="paper-card overflow-hidden">
      {/* Cover image or placeholder */}
      <Link to={`/books/${book._id}`} className="block no-underline">
        <div className="h-48 overflow-hidden relative">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 border-b-2 border-gold"
            />
          ) : (
            <div className="w-full h-full bg-[#490000] flex items-center justify-center border-b-2 border-gold overflow-hidden group">
              <img
                src="/assets/default-book-cover.jpg"
                alt={book.title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          {/* Visibility badge */}
          <span className={`absolute top-3 right-3 ${book.isPublic ? 'badge-public' : 'badge-private'}`}>
            {book.isPublic ? (
              <span className="flex items-center gap-1">
                <HiOutlineGlobeAlt className="text-xs" /> Public
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <HiOutlineLockClosed className="text-xs" /> Private
              </span>
            )}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 bg-paper-dark">
        <Link to={`/books/${book._id}`} className="no-underline">
          <h3 className="font-heading text-3xl font-bold text-maroon mb-1 hover:text-maroon-dark transition-colors drop-shadow-sm">
            {book.title}
          </h3>
        </Link>

        {book.description && (
          <p className="text-ink-muted text-sm mb-3 line-clamp-2">
            {book.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-ink-light font-subheading mt-4">
          <span className="flex items-center gap-1">
            <HiOutlineBookOpen className="text-sm text-gold-dark" />
            {book.entryCount || 0} {book.entryCount === 1 ? 'entry' : 'entries'}
          </span>

          {showOwner && book.owner?.name && (
            <span className="italic">by {book.owner.name}</span>
          )}
        </div>

        {/* Owner actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-gold/30">
            {onEdit && (
              <button
                onClick={() => onEdit(book._id)}
                className="btn-secondary text-xs py-1.5 px-3 bg-paper"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(book._id)}
                className="btn-danger text-xs py-1.5 px-3"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
