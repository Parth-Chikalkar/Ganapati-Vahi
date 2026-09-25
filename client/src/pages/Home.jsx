import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { HiOutlineBookOpen } from 'react-icons/hi';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPublicBooks = async () => {
      try {
        const { data } = await API.get('/books/public');
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch public books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicBooks();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-24 px-4 relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-8 relative">
            <img 
              src="/assets/hero-ganapati.jpg" 
              alt="Traditional Ganapati" 
              className="w-full h-full object-cover rounded-full border-4 border-gold shadow-[0_8px_16px_rgba(62,39,35,0.4)]"
            />
            <div className="absolute inset-0 rounded-full border border-maroon/20 -m-2"></div>
          </div>
          <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl text-maroon mb-2 drop-shadow-sm">
            बाप्पाची वही
          </h1>
          <p className="font-subheading text-2xl sm:text-3xl text-ink-light mb-6">
            Your Digital Ganapati Scrapbook
          </p>
          <p className="text-ink font-body text-lg max-w-xl mx-auto mb-10 leading-relaxed bg-paper/80 p-4 rounded backdrop-blur-sm border border-paper-aged">
            Remember the joy of cutting Ganapati pictures from newspapers and pasting them in a notebook?
            Bring that tradition online — preserve your memories, photos, and devotion in a beautiful digital scrapbook.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3 no-underline">
                My Scrapbooks
              </Link>
            ) : (
              <Link to="/signup" className="btn-primary text-lg px-8 py-3 no-underline">
                Start Collecting
              </Link>
            )}
            <a href="#explore" className="btn-secondary text-lg px-8 py-3 no-underline">
              Explore Books
            </a>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="h-px bg-paper-aged flex-1 max-w-32"></div>
        <span className="text-2xl">🪷</span>
        <div className="h-px bg-paper-aged flex-1 max-w-32"></div>
      </div>

      {/* Public Books */}
      <section id="explore" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-heading text-4xl sm:text-5xl text-maroon text-center mb-10">
          <HiOutlineBookOpen className="inline-block mr-3 text-gold" />
          Public Collections
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink-muted font-subheading text-xl">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 paper-card max-w-md mx-auto p-8">
            <p className="font-heading text-3xl text-maroon mb-2">No public books yet</p>
            <p className="text-ink-muted text-sm">
              Be the first to create and share a collection!
            </p>
            <Link
              to={user ? '/create-book' : '/login'}
              className="btn-primary mt-4 inline-block no-underline"
            >
              Create a Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {books.map((book) => (
              <BookCard key={book._id} book={book} showOwner={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
