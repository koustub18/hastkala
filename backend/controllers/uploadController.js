// @desc    Upload a single product image
// @route   POST /api/upload
// @access  Private
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return the URL path — this will be served via express.static('/uploads')
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadImage
};
