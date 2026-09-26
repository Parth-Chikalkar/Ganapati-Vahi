import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EntryCard from '../components/EntryCard';
import EntryModal from '../components/EntryModal';
import ShareModal from '../components/ShareModal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed,
  HiOutlineShare,
  HiArrowLeft,
} from 'react-icons/hi';

const BookView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const isOwner = user && book && user._id === (book.owner?._id || book.owner);

  useEffect(() => {
    const fetchBookAndEntries = async () => {
      try {
        const [bookRes, entriesRes] = await Promise.all([
          API.get(`/books/${id}`),
          API.get(`/entries/${id}`),
        ]);
        setBook(bookRes.data);
        setEntries(entriesRes.data);
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error('This book is private');
          navigate('/');
        } else {
          toast.error('Failed to load book');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndEntries();
  }, [id, navigate]);

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this entry? The image and video will be permanently removed.')) {
      return;
    }
    try {
      await API.delete(`/entries/${entryId}`);
      setEntries(entries.filter((e) => e._id !== entryId));
      setSelectedEntryIndex(null);
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleEditEntry = (entryId) => {
    navigate(`/entries/${entryId}/edit`);
  };

  const handleNextEntry = () => {
    if (selectedEntryIndex !== null && entries.length > 0) {
      setSelectedEntryIndex((prev) => (prev + 1) % entries.length);
    }
  };

  const handlePrevEntry = () => {
    if (selectedEntryIndex !== null && entries.length > 0) {
      setSelectedEntryIndex((prev) => (prev - 1 + entries.length) % entries.length);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-ink-muted font-heading text-xl">Opening book...</p>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-ink-light hover:text-maroon transition-colors mb-6 bg-transparent border-none cursor-pointer font-subheading text-lg"
      >
        <HiArrowLeft /> Back
      </button>

      {/* Book header */}
      <div className="paper-card p-6 sm:p-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-heading text-5xl sm:text-6xl font-bold text-maroon drop-shadow-sm">
                {book.title}
              </h1>
              <span className={book.isPublic ? 'badge-public' : 'badge-private'}>
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

            {book.description && (
              <p className="text-ink font-body text-lg mb-4">{book.description}</p>
            )}

            <p className="text-sm font-subheading text-ink-light">
              By <strong className="text-maroon">{book.owner?.name || 'Unknown'}</strong> •{' '}
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <button
                onClick={() => setShowShareModal(true)}
                className="btn-secondary flex items-center gap-1 text-sm cursor-pointer"
                id="share-book-btn"
              >
                <HiOutlineShare /> Share
              </button>
              <Link
                to={`/books/${book._id}/edit`}
                className="btn-secondary flex items-center gap-1 text-sm no-underline"
              >
                <HiOutlinePencil /> Edit Book
              </Link>
              <Link
                to={`/books/${book._id}/add-entry`}
                className="btn-primary flex items-center gap-1 text-sm no-underline"
              >
                <HiOutlinePlusCircle /> Add Entry
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Entries grid — scrapbook layout */}
      {entries.length === 0 ? (
        <div className="text-center py-16 paper-card max-w-md mx-auto p-8">
          <p className="font-heading text-3xl text-ink mb-2">No entries yet</p>
          <p className="text-ink-muted text-sm mb-4">
            {isOwner
              ? 'Start adding Ganapati photos to your scrapbook!'
              : 'This book has no entries yet.'}
          </p>
          {isOwner && (
            <Link
              to={`/books/${book._id}/add-entry`}
              className="btn-primary no-underline"
            >
              Add First Entry
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {entries.map((entry, index) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              isOwner={isOwner}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onClick={() => setSelectedEntryIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Full detail modal for selected entry */}
      {selectedEntryIndex !== null && entries[selectedEntryIndex] && (
        <EntryModal
          entry={entries[selectedEntryIndex]}
          onClose={() => setSelectedEntryIndex(null)}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          isOwner={isOwner}
          onNext={entries.length > 1 ? handleNextEntry : undefined}
          onPrev={entries.length > 1 ? handlePrevEntry : undefined}
          currentIndex={selectedEntryIndex}
          totalEntries={entries.length}
        />
      )}

      {/* Share Modal */}
      {showShareModal && book && (
        <ShareModal
          book={book}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default BookView;
