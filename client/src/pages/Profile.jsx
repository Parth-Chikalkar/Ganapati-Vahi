import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { HiOutlineUser, HiOutlineMail, HiOutlineCalendar, HiOutlineBookOpen, HiOutlinePhotograph } from 'react-icons/hi';

const Profile = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBooks: 0, totalEntries: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get('/books/my');
        setBooks(data);
        const totalEntries = data.reduce((sum, book) => sum + (book.entryCount || 0), 0);
        setStats({ totalBooks: data.length, totalEntries });
      } catch (error) {
        console.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Profile card */}
      <div className="paper-card p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-saffron to-saffron-light flex items-center justify-center text-white text-4xl font-heading font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="font-heading text-4xl font-bold text-ink mb-3">
              {user?.name}
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                <HiOutlineMail className="text-saffron" /> {user?.email}
              </span>
              {joinedDate && (
                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <HiOutlineCalendar className="text-saffron" /> Joined {joinedDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-paper rounded-lg p-4 text-center">
            <HiOutlineBookOpen className="text-3xl text-saffron mx-auto mb-1" />
            <p className="font-heading text-3xl font-bold text-ink">{stats.totalBooks}</p>
            <p className="text-sm text-ink-muted">Books</p>
          </div>
          <div className="bg-paper rounded-lg p-4 text-center">
            <HiOutlinePhotograph className="text-3xl text-saffron mx-auto mb-1" />
            <p className="font-heading text-3xl font-bold text-ink">{stats.totalEntries}</p>
            <p className="text-sm text-ink-muted">Entries</p>
          </div>
        </div>
      </div>

      {/* User's books */}
      <h2 className="font-heading text-3xl font-bold text-ink mb-6">My Books</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-muted font-heading text-xl">Loading...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-8 paper-card p-8">
          <p className="font-heading text-2xl text-ink-muted mb-4">No books yet</p>
          <Link to="/create-book" className="btn-primary no-underline">
            Create Your First Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-children">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
