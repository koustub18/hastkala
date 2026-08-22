const User = require('../models/User');

// @desc    Return logged-in artisan's profile
// @route   GET /api/artisans/me
// @access  Private/Artisan
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Save onboarding profile data
// @route   PUT /api/artisans/me
// @access  Private/Artisan
const updateMyProfile = async (req, res) => {
  try {
    const { location, specialty, upi, image } = req.body;
    // Only update allowed fields — isVerified is set server-side only
    const updateFields = {};
    if (location !== undefined) updateFields.location = location;
    if (specialty !== undefined) updateFields.specialty = specialty;
    if (upi !== undefined) updateFields.upi = upi;
    if (image !== undefined) updateFields.image = image;
    updateFields.isVerified = true; // Server controls this
    
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all artisans (public listing, safe fields only)
// @route   GET /api/artisans
// @access  Public
const getArtisans = async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan', status: 'active' })
      .select('name image location specialty isVerified');
    res.json(artisans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getArtisans
};
