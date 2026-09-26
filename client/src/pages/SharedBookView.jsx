import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import EntryModal from '../components/EntryModal';
import {
  HiOutlineGlobeAlt,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineArrowsExpand,
} from 'react-icons/hi';
import { GiElephant } from 'react-icons/gi';

const SharedBookView = () => {
  const { shareId } = useParams();
  const [book, setBook] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);

  useEffect(() => {
    const fetchSharedBook = async () => {
      try {
        const res = await API.get(`/share/view/${shareId}`);
        setBook(res.data.book);
        setEntries(res.data.entries);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('This shared book was not found.');
        } else if (err.response?.status === 403) {
          setError('This book is no longer shared by its owner.');
        } else {
          setError('Failed to load the shared book.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSharedBook();
  }, [shareId]);

  const handleNextEntry = () => {
    if (selectedEntryIndex !== null && entries.length > 0) {
      setSelectedEntryIndex((prev) => (prev + 1) % entries.length);
    }
  };

  const handlePrevEntry = () => {
    if (selectedEntryIndex !== null && entries.length > 0) {
      setSelectedEntryIndex(
        (prev) => (prev - 1 + entries.length) % entries.length
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-ink-muted font-heading text-xl">
          Opening shared Vahi...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4">
        <div className="paper-card max-w-md w-full p-8 text-center">
          <GiElephant className="text-6xl text-maroon/30 mx-auto mb-4" />
          <h2 className="font-heading text-3xl text-maroon mb-3">
            Oops!
          </h2>
          <p className="text-ink-muted font-body mb-6">{error}</p>
          <Link
            to="/"
            className="btn-primary no-underline inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const formattedDate = new Date(book.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="shared-book-page min-h-screen bg-paper">
      {/* Minimal branded header for shared view */}
      <div className="shared-header bg-paper-dark/90 backdrop-blur-sm border-b-2 border-gold sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <GiElephant className="text-2xl text-maroon" />
              <span className="font-heading text-xl sm:text-2xl text-maroon">
                गणपती वही
              </span>
            </Link>
            <span className="shared-view-badge flex items-center gap-1.5 text-xs font-subheading text-ink-muted bg-paper border border-gold/40 px-3 py-1 rounded-full">
              <HiOutlineGlobeAlt className="text-saffron" />
              Shared View
            </span>
          </div>
        </div>
      </div>

      {/* Book header section */}
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="paper-card p-6 sm:p-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Cover image */}
            {book.coverImage && (
              <div className="flex-shrink-0">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gold shadow-md"
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-maroon drop-shadow-sm">
                  {book.title}
                </h1>
              </div>

              {book.description && (
                <p className="text-ink font-body text-lg mb-4">
                  {book.description}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap text-sm font-subheading text-ink-light">
                <span>
                  By{' '}
                  <strong className="text-maroon">{book.ownerName}</strong>
                </span>
                <span>•</span>
                <span>
                  {entries.length}{' '}
                  {entries.length === 1 ? 'entry' : 'entries'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HiOutlineCalendar className="text-xs" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="text-center text-xs text-ink-muted font-subheading mt-3">
            🙏 A shared Ganapati Vahi — view only
          </p>
        </div>

        {/* Entries grid */}
        {entries.length === 0 ? (
          <div className="text-center py-16 paper-card max-w-md mx-auto p-8">
            <p className="font-heading text-3xl text-ink mb-2">
              No entries yet
            </p>
            <p className="text-ink-muted text-sm">
              This book has no entries yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {entries.map((entry, index) => (
              <SharedEntryCard
                key={entry._id}
                entry={entry}
                onClick={() => setSelectedEntryIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Entry detail modal (read-only) */}
        {selectedEntryIndex !== null && entries[selectedEntryIndex] && (
          <EntryModal
            entry={entries[selectedEntryIndex]}
            onClose={() => setSelectedEntryIndex(null)}
            onEdit={() => {}}
            onDelete={() => {}}
            isOwner={false}
            onNext={entries.length > 1 ? handleNextEntry : undefined}
            onPrev={entries.length > 1 ? handlePrevEntry : undefined}
            currentIndex={selectedEntryIndex}
            totalEntries={entries.length}
          />
        )}
      </div>

      {/* Footer */}
      <div className="rangoli-border-bottom mt-16" />
      <footer className="bg-transparent py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-heading text-2xl text-maroon mb-2">
            🙏 गणपती बाप्पा मोरया 🙏
          </p>
          <p className="text-sm font-subheading text-ink-muted">
            Collecting memories, one Ganapati at a time
          </p>
          <p className="text-xs font-subheading text-ink-light mt-3">
            <Link
              to="/"
              className="text-maroon hover:text-saffron transition-colors no-underline"
            >
              Create your own Ganapati Vahi →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

/* ─── Shared Entry Card (read-only, reuses polaroid style) ─── */
const SharedEntryCard = ({ entry, onClick }) => {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
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

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-maroon-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-paper/90 text-maroon text-xs font-subheading px-3 py-1.5 rounded-full border border-gold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <HiOutlineArrowsExpand className="text-sm" /> Click to Expand
          </span>
        </div>

        {entry.videoUrl && (
          <span className="absolute top-2 right-2 z-10 bg-maroon/80 text-gold p-1.5 rounded-full border border-gold pointer-events-none">
            <HiOutlineVideoCamera className="text-lg" />
          </span>
        )}
      </div>

      {/* Caption */}
      <div className="pt-4 px-1">
        <h4 className="font-heading text-2xl text-maroon mb-1 group-hover:text-maroon-dark transition-colors">
          {entry.title}
        </h4>
        {entry.description && (
          <p className="text-ink text-sm mb-3 font-body line-clamp-3">
            {entry.description}
          </p>
        )}
        <span className="text-xs text-ink-light font-subheading">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};

export default SharedBookView;
