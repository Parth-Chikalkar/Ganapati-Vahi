import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineVideoCamera } from 'react-icons/hi';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB limit

const EditEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [currentVideo, setCurrentVideo] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookId, setBookId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const { data } = await API.get(`/entries/single/${id}`);
        setTitle(data.title);
        setDescription(data.description || '');
        setCurrentImage(data.imageUrl);
        setCurrentVideo(data.videoUrl || '');
        setBookId(data.book);
      } catch (error) {
        toast.error('Failed to load entry');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('Photo size must be 10MB or less');
        e.target.value = '';
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error('Video size must be 10MB or less');
        e.target.value = '';
        return;
      }
      setVideo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (image && image.size > MAX_IMAGE_SIZE) {
      toast.error('Photo size must be 10MB or less');
      return;
    }
    if (video && video.size > MAX_VIDEO_SIZE) {
      toast.error('Video size must be 10MB or less');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);

    setSubmitting(true);
    setUploadProgress(0);

    try {
      await API.put(`/entries/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      toast.success('Entry updated!');
      navigate(`/books/${bookId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update entry');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-ink-muted font-heading text-xl">Loading entry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink mb-8 text-center">
        Edit Entry
      </h1>

      <div className="paper-card p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="title" className="form-label">Title / Name</label>
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
              className="form-input min-h-24 resize-y disabled:opacity-60 disabled:cursor-not-allowed"
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Current image + replace */}
          <div>
            <label className="form-label">Photo (max 10MB)</label>
            {(imagePreview || currentImage) && (
              <img
                src={imagePreview || currentImage}
                alt="Current"
                className="max-h-48 object-contain rounded mb-3"
              />
            )}
            <label
              htmlFor="image"
              className={`flex items-center justify-center gap-3 border-2 border-dashed border-paper-aged rounded-lg p-4 transition-colors bg-paper/50 ${
                submitting
                  ? 'opacity-60 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer hover:border-saffron'
              }`}
            >
              <HiOutlinePhotograph className="text-2xl text-ink-muted" />
              <span className="text-ink-muted text-sm">
                {image ? image.name : 'Click to replace image (max 10MB)'}
              </span>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={submitting}
                className="hidden"
              />
            </label>
          </div>

          {/* Video */}
          <div>
            <label className="form-label">Video (optional — max 10MB)</label>
            {currentVideo && !video && (
              <p className="text-sm text-ink-muted mb-2">
                Current video: <a href={currentVideo} target="_blank" rel="noopener noreferrer" className="text-saffron">View</a>
              </p>
            )}
            <label
              htmlFor="video"
              className={`flex items-center justify-center gap-3 border-2 border-dashed border-paper-aged rounded-lg p-4 transition-colors bg-paper/50 ${
                submitting
                  ? 'opacity-60 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer hover:border-saffron'
              }`}
            >
              <HiOutlineVideoCamera className="text-2xl text-ink-muted" />
              <span className="text-ink-muted text-sm">
                {video ? video.name : 'Click to replace video (max 10MB)'}
              </span>
              <input
                type="file"
                id="video"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleVideoChange}
                disabled={submitting}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload progress bar */}
          {submitting && (
            <div className="w-full space-y-1.5 my-2">
              <div className="flex justify-between text-xs font-subheading text-ink-light">
                <span>Saving entry & uploading asset...</span>
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
              onClick={() => navigate(`/books/${bookId}`)}
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

export default EditEntry;
