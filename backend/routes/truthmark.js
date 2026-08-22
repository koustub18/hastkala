const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { verifyAuthContext, verifyArtisan } = require('../middleware/roleCheck');

const {
  registerTruthMark,
  verifyTruthMark,
  getTruthMarks
} = require('../controllers/truthmarkController');

// ── Multer Config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Photo must be an image file'), false);
      }
    }
    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Video must be a video file'), false);
      }
    }
    cb(null, true);
  }
});

// @route   POST /api/truthmark/register
router.post('/register',
  verifyAuthContext,
  verifyArtisan,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  registerTruthMark
);

// @route   GET /api/truthmark/:code
router.get('/:code', verifyTruthMark);

// @route   GET /api/truthmark/list
router.get('/', getTruthMarks);

module.exports = router;
