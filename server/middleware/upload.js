const multer = require('multer');
const path = require('path');

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit for photo / thumbnail
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB limit for video

// Disk storage for temporary files before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter — allow images and videos only
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

  if ((file.fieldname === 'image' || file.fieldname === 'thumbnail') && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: JPG, PNG, WEBP for images; MP4, MOV, WEBM for videos.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB absolute multer limit
  },
});

// Middleware to enforce specific size restrictions: Photo <= 10MB, Video <= 10MB
const validateFileSizes = (req, res, next) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      Object.values(req.files).forEach((fileArray) => files.push(...fileArray));
    }
  }

  for (const file of files) {
    if ((file.fieldname === 'image' || file.fieldname === 'thumbnail') && file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({ message: 'Photo size must be 10MB or less' });
    }
    if (file.fieldname === 'video' && file.size > MAX_VIDEO_SIZE) {
      return res.status(400).json({ message: 'Video size must be 10MB or less' });
    }
  }

  next();
};

upload.validateFileSizes = validateFileSizes;

module.exports = upload;
