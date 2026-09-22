import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlinePlusCircle } from 'react-icons/hi';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data } = await API.get('/books/my');
      setBooks(data);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book? All entries will be permanently removed.')) {
      return;
    }
    try {
      await API.delete(`/books/${bookId}`);
      setBooks(books.filter((b) => b._id !== bookId));
      toast.success('Book deleted');
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleEdit = (bookId) => {
    navigate(`/books/${bookId}/edit`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink">
            My Books
          </h1>
          <p className="text-ink-muted mt-1">
            Welcome, {user?.name}! Here are your Ganapati collections.
          </p>
        </div>
        <Link
          to="/create-book"
          className="btn-primary flex items-center gap-2 w-fit no-underline"
        >
          <HiOutlinePlusCircle className="text-xl" />
          New Book
        </Link>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-muted font-heading text-xl">Loading your books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 paper-card max-w-lg mx-auto p-10">
          <p className="font-heading text-3xl text-ink mb-2">No books yet!</p>
          <p className="text-ink-muted mb-6">
            Create your first Ganapati scrapbook and start collecting beautiful memories.
          </p>
          <Link to="/create-book" className="btn-primary no-underline">
            Create Your First Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
