const multer = require('multer');
const path = require('path');

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
    fileSize: 50 * 1024 * 1024, // 50MB max (covers video)
  },
});

module.exports = upload;
