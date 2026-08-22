const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const TruthMark = require('../models/TruthMark');
const Product = require('../models/Product');
const { generateTruthMarkCode } = require('../utils/truthmarkHelper');
const { uploadToPinata } = require('../utils/pinataHelper');

// @desc    Artisan registers a product for TruthMark
// @route   POST /api/truthmark/register
// @access  Private/Artisan
const registerTruthMark = async (req, res) => {
  try {
    const { artisanName, village, craftType, story, lat, lng, productId } = req.body;

    // Validation
    if (!artisanName || !village || !craftType) {
      return res.status(400).json({
        message: 'artisanName, village, and craftType are required'
      });
    }

    // 1. Upload files to Pinata / local fallback
    let photoIPFS = '';
    let videoIPFS = '';

    if (req.files?.photo?.[0]) {
      photoIPFS = await uploadToPinata(
        req.files.photo[0].path,
        req.files.photo[0].originalname
      );
    }

    if (req.files?.video?.[0]) {
      videoIPFS = await uploadToPinata(
        req.files.video[0].path,
        req.files.video[0].originalname
      );
    }

    // 2. Generate unique TruthMark code
    let truthMarkCode;
    let isUnique = false;
    while (!isUnique) {
      truthMarkCode = generateTruthMarkCode(craftType);
      const existing = await TruthMark.findOne({ truthMarkCode });
      if (!existing) isUnique = true;
    }

    // 3. Generate QR Code
    const qrDir = path.join(__dirname, '..', 'qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const qrFileName = `${truthMarkCode}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    const verifyUrl = `http://localhost:5173/verify/${truthMarkCode}`;

    await QRCode.toFile(qrFilePath, verifyUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      }
    });

    // 4. Save to MongoDB
    const record = new TruthMark({
      truthMarkCode,
      artisanName,
      village,
      gpsCoords: {
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null
      },
      craftType: craftType.toLowerCase(),
      story: story || '',
      photoIPFS,
      videoIPFS,
      qrCodePath: `/qrcodes/${qrFileName}`
    });

    await record.save();

    // 5. Update Product if productId is provided
    if (productId) {
      await Product.findByIdAndUpdate(productId, { truthMarkCode });
      console.log(`✅ Product ${productId} retroactively linked to ${truthMarkCode}`);
    }

    console.log(`✅ TruthMark registered: ${truthMarkCode} for ${artisanName}`);

    res.status(201).json({
      message: 'TruthMark registered successfully!',
      truthMarkCode,
      qrCodeUrl: `/qrcodes/${qrFileName}`,
      verifyUrl,
      photoIPFS,
      videoIPFS
    });

  } catch (err) {
    console.error('TruthMark registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Buyer verification lookup
// @route   GET /api/truthmark/:code
// @access  Public
const verifyTruthMark = async (req, res) => {
  try {
    const product = await TruthMark.findOne({
      truthMarkCode: req.params.code.toUpperCase()
    });

    if (!product) {
      return res.json({
        valid: false,
        message: 'No product found with this TruthMark code.'
      });
    }

    res.json({
      valid: true,
      data: {
        truthMarkCode: product.truthMarkCode,
        artisanName: product.artisanName,
        village: product.village,
        gpsCoords: product.gpsCoords,
        craftType: product.craftType,
        story: product.story,
        photoIPFS: product.photoIPFS,
        videoIPFS: product.videoIPFS,
        qrCodePath: product.qrCodePath,
        createdAt: product.createdAt
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    List all TruthMark entries (for admin/debug)
// @route   GET /api/truthmark
// @access  Public
const getTruthMarks = async (req, res) => {
  try {
    const records = await TruthMark.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerTruthMark,
  verifyTruthMark,
  getTruthMarks
};
