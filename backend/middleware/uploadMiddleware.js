const multer = require('multer');

// Use memory storage - files are stored in buffer, not on disk
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|ogg|mov|avi/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, webm, ogg, mov, avi) are allowed!'), false);
  }
};

// File filter for measurement files (images and PDFs)
const measurementFileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const pdfType = /pdf/;
  const ext = file.originalname.toLowerCase().split('.').pop();
  
  if (imageTypes.test(ext) || imageTypes.test(file.mimetype)) {
    cb(null, true);
  } else if (pdfType.test(ext) || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDF files are allowed!'), false);
  }
};

// File filter for both images and videos
const mediaFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|webm|ogg|mov|avi/;
  const ext = file.originalname.toLowerCase().split('.').pop();
  
  if (imageTypes.test(ext) || imageTypes.test(file.mimetype)) {
    cb(null, true);
  } else if (videoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

// Product image upload (multiple images, max 50MB each)
const uploadProductImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB - increased for high-res images
});

// Category image upload (single image, max 50MB)
const uploadCategoryImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Hero image upload (multiple images, max 50MB each)
const uploadHeroImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Hero video upload (single video, max 200MB)
const uploadHeroVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB - increased for high-quality videos
});

// Avatar upload (single image, max 5MB)
const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// General media upload (images or videos)
const uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Measurement files upload (images and PDFs, max 10MB each)
const uploadMeasurementFiles = multer({
  storage,
  fileFilter: measurementFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = {
  uploadProductImage,
  uploadCategoryImage,
  uploadHeroImage,
  uploadHeroVideo,
  uploadAvatar,
  uploadMedia,
  uploadMeasurementFiles,
};
