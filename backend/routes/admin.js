const express = require('express');
const router = express.Router();
const { verifyAuthContext, verifyAdmin } = require('../middleware/roleCheck');

const {
  getUsers,
  toggleBanUser,
  getPendingArtisans,
  updateArtisanStatus,
  getAdminStats
} = require('../controllers/adminController');

// @route   GET /api/admin/users
router.get('/users', verifyAuthContext, verifyAdmin, getUsers);

// @route   PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', verifyAuthContext, verifyAdmin, toggleBanUser);

// @route   GET /api/admin/artisans/pending
router.get('/artisans/pending', verifyAuthContext, verifyAdmin, getPendingArtisans);

// @route   GET /api/admin/artisans/:id/status
router.put('/artisans/:id/status', verifyAuthContext, verifyAdmin, updateArtisanStatus);

// @route   GET /api/admin/stats
router.get('/stats', verifyAuthContext, verifyAdmin, getAdminStats);

module.exports = router;
