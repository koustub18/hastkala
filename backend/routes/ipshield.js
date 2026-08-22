const express = require('express');
const router = express.Router();

const { verifyAuthContext, verifyArtisan } = require('../middleware/roleCheck');

const {
  scanProduct,
  issueTakedown
} = require('../controllers/ipshieldController');

// @route   POST /api/ipshield/scan
router.post('/scan', verifyAuthContext, verifyArtisan, scanProduct);

// @route   POST /api/ipshield/takedown
router.post('/takedown', verifyAuthContext, verifyArtisan, issueTakedown);

module.exports = router;
