const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const { verifyAuthContext } = require('../middleware/roleCheck');
const { uploadImage } = require('../controllers/uploadController');

// ── Multer Storage Config ────────────────────────────────────────────────────
// Saves uploaded product images to backend/uploads/ with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex.ext
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max per file
  }
});

// @route   POST /api/upload
router.post('/', verifyAuthContext, upload.single('image'), uploadImage);

// Multer error handler middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;
