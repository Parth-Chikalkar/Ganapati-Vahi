import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineVideoCamera } from 'react-icons/hi';

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
        // We need to find the entry — we'll search through the API
        // Since there's no direct GET /entries/:id, we get it indirectly
        // Actually let's add a simple approach: get from the response
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
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
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
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
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
              className="form-input"
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
              className="form-input min-h-24 resize-y"
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Current image + replace */}
          <div>
            <label className="form-label">Photo</label>
            {(imagePreview || currentImage) && (
              <img
                src={imagePreview || currentImage}
                alt="Current"
                className="max-h-48 object-contain rounded mb-3"
              />
            )}
            <label
              htmlFor="image"
              className="flex items-center justify-center gap-3 border-2 border-dashed border-paper-aged rounded-lg p-4 cursor-pointer hover:border-saffron transition-colors bg-paper/50"
            >
              <HiOutlinePhotograph className="text-2xl text-ink-muted" />
              <span className="text-ink-muted text-sm">
                {image ? image.name : 'Click to replace image'}
              </span>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Video */}
          <div>
            <label className="form-label">Video (optional)</label>
            {currentVideo && !video && (
              <p className="text-sm text-ink-muted mb-2">
                Current video: <a href={currentVideo} target="_blank" rel="noopener noreferrer" className="text-saffron">View</a>
              </p>
            )}
            <label
              htmlFor="video"
              className="flex items-center justify-center gap-3 border-2 border-dashed border-paper-aged rounded-lg p-4 cursor-pointer hover:border-saffron transition-colors bg-paper/50"
            >
              <HiOutlineVideoCamera className="text-2xl text-ink-muted" />
              <span className="text-ink-muted text-sm">
                {video ? video.name : 'Click to replace video'}
              </span>
              <input
                type="file"
                id="video"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload progress */}
          {submitting && uploadProgress > 0 && (
            <div className="w-full bg-paper-aged rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, #e85d04, #f48c06)',
                }}
              ></div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {submitting ? `Saving... ${uploadProgress}%` : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/books/${bookId}`)}
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

export default EditEntry;
