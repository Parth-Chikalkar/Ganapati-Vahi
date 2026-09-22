import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineVideoCamera } from 'react-icons/hi';

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
    if (!image) {
      toast.error('Please select a Ganapati image');
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
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
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
              className="form-input"
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
              className="form-input min-h-24 resize-y"
              placeholder="Write something about this Ganapati..."
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="form-label">Ganapati Photo *</label>
            <label
              htmlFor="image"
              className="newspaper-upload-area flex flex-col items-center justify-center cursor-pointer"
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
                  <span className="text-ink-muted text-xs mt-1">Paste your photo here (JPG, PNG, WEBP max 10MB)</span>
                </>
              )}
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Video upload */}
          <div>
            <label className="form-label">Video (optional)</label>
            <label
              htmlFor="video"
              className="flex items-center justify-center gap-3 border-2 border-dashed border-ink-light/30 rounded-lg p-4 cursor-pointer hover:border-maroon transition-colors bg-transparent"
            >
              <HiOutlineVideoCamera className="text-2xl text-ink-light" />
              <span className="text-ink-light text-sm font-subheading">
                {video ? video.name : 'Click to select a video (MP4, MOV, WEBM)'}
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
                  background: 'linear-gradient(90deg, var(--color-maroon), var(--color-maroon-dark))',
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
              {submitting ? `Uploading... ${uploadProgress}%` : 'Add Entry'}
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

export default AddEntry;
