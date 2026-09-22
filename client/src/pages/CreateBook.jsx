import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CreateBook = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('isPublic', isPublic);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const { data } = await API.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Book created! 📖');
      navigate(`/books/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink mb-8 text-center">
        Create New Book
      </h1>

      <div className="paper-card p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="title" className="form-label">Book Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="e.g., Lalbaugcha Raja Collection"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input min-h-28 resize-y"
              placeholder="What's this collection about?"
              maxLength={500}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="form-label">Thumbnail (Optional)</label>
            <input
              type="file"
              id="thumbnail"
              accept="image/jpeg, image/png, image/webp, image/jpg"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-saffron/10 file:text-saffron hover:file:bg-saffron/20 cursor-pointer"
            />
            <p className="text-xs text-ink-muted mt-1">Recommended size: 800x600px (JPG, PNG, WEBP)</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 accent-saffron cursor-pointer"
            />
            <label htmlFor="isPublic" className="cursor-pointer text-ink-light">
              Make this book <strong>public</strong> — visible to everyone
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Book'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;
