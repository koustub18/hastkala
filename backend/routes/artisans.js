const express = require('express');
const router = express.Router();

const { verifyAuthContext, verifyArtisan } = require('../middleware/roleCheck');

const {
  getMyProfile,
  updateMyProfile,
  getArtisans
} = require('../controllers/artisanController');

// @route   GET /api/artisans/me
router.get('/me', verifyAuthContext, verifyArtisan, getMyProfile);

// @route   PUT /api/artisans/me
router.put('/me', verifyAuthContext, verifyArtisan, updateMyProfile);

// @route   GET /api/artisans
router.get('/', getArtisans);

module.exports = router;

