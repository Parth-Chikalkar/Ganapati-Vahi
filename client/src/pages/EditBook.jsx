import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await API.get(`/books/${id}`);
        setTitle(data.title);
        setDescription(data.description || '');
        setIsPublic(data.isPublic);
        setExistingThumbnail(data.coverImage || '');
      } catch (error) {
        toast.error('Failed to load book');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('Photo size must be 10MB or less');
        e.target.value = '';
        return;
      }
      setThumbnail(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    if (thumbnail && thumbnail.size > MAX_IMAGE_SIZE) {
      toast.error('Photo size must be 10MB or less');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('isPublic', isPublic);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      await API.put(`/books/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      toast.success('Book updated!');
      navigate(`/books/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update book');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-ink-muted font-heading text-xl">Loading book...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink mb-8 text-center">
        Edit Book
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
              disabled={submitting}
              className="form-input disabled:opacity-60 disabled:cursor-not-allowed"
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
              disabled={submitting}
              className="form-input min-h-28 resize-y disabled:opacity-60 disabled:cursor-not-allowed"
              maxLength={500}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="form-label">Thumbnail (Optional — max 10MB)</label>
            {existingThumbnail && !thumbnail && (
              <div className="mb-3">
                <img src={existingThumbnail} alt="Current thumbnail" className="h-32 w-auto object-cover rounded shadow-sm" />
                <p className="text-xs text-ink-muted mt-1">Current thumbnail</p>
              </div>
            )}
            {thumbnail && (
              <div className="mb-3">
                <img src={URL.createObjectURL(thumbnail)} alt="New thumbnail preview" className="h-32 w-auto object-cover rounded shadow-sm" />
                <p className="text-xs text-ink-muted mt-1">New thumbnail preview</p>
              </div>
            )}
            <input
              type="file"
              id="thumbnail"
              accept="image/jpeg, image/png, image/webp, image/jpg"
              onChange={handleThumbnailChange}
              disabled={submitting}
              className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-saffron/10 file:text-saffron hover:file:bg-saffron/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
            />
            <p className="text-xs text-ink-muted mt-1">Recommended size: 800x600px (JPG, PNG, WEBP — max 10MB)</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={submitting}
              className="w-5 h-5 accent-saffron cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <label htmlFor="isPublic" className="cursor-pointer text-ink-light">
              Make this book <strong>public</strong>
            </label>
          </div>

          {/* Upload progress bar */}
          {submitting && (
            <div className="w-full space-y-1.5 my-2">
              <div className="flex justify-between text-xs font-subheading text-ink-light">
                <span>Saving book changes...</span>
                <span className="font-semibold text-maroon">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-paper-dark border border-gold/40 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-maroon via-saffron to-maroon"
                  style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving... {uploadProgress}%</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/books/${id}`)}
              disabled={submitting}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
