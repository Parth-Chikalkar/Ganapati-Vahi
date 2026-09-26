import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineVideoCamera } from 'react-icons/hi';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB limit

const AddEntry = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    if (!image) {
      toast.error('Please select a Ganapati image');
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
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
    formData.append('image', image);
    if (video) {
      formData.append('video', video);
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      await API.post(`/entries/${bookId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      toast.success('Entry added! 🙏');
      navigate(`/books/${bookId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add entry');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="font-heading text-5xl sm:text-6xl font-bold text-maroon mb-8 text-center drop-shadow-sm">
        Add Ganapati Entry
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
              placeholder="e.g., Lalbaugcha Raja 2024"
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
              placeholder="Write something about this Ganapati..."
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Image upload area */}
          <div>
            <label className="form-label">Ganapati Photo * (max 10MB)</label>
            <label
              htmlFor="image"
              className={`newspaper-upload-area flex flex-col items-center justify-center ${
                submitting
                  ? 'opacity-60 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer'
              }`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 object-contain rounded mb-2 shadow-md"
                />
              ) : (
                <>
                  <HiOutlinePhotograph className="text-5xl text-ink-muted mb-2" />
                  <span className="text-ink text-lg font-subheading">Click to select an image</span>
                  <span className="text-ink-muted text-xs mt-1">Paste your photo here (JPG, PNG, WEBP — max 10MB)</span>
                </>
              )}
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

          {/* Video upload area */}
          <div>
            <label className="form-label">Video (optional — max 10MB)</label>
            <label
              htmlFor="video"
              className={`flex items-center justify-center gap-3 border-2 border-dashed border-ink-light/30 rounded-lg p-4 transition-colors bg-transparent ${
                submitting
                  ? 'opacity-60 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer hover:border-maroon'
              }`}
            >
              <HiOutlineVideoCamera className="text-2xl text-ink-light" />
              <span className="text-ink-light text-sm font-subheading">
                {video ? video.name : 'Click to select a video (MP4, MOV, WEBM — max 10MB)'}
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
                <span>Uploading asset & entry data...</span>
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
                  <span>Uploading... {uploadProgress}%</span>
                </>
              ) : (
                'Add Entry'
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

export default AddEntry;
