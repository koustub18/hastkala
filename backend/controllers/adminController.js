const User = require('../models/User');

// @desc    Fetch all buyers and artisans for the Admin Dashboard
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skipNum = (pageNum - 1) * limitNum;

    const query = { role: { $in: ['buyer', 'artisan', 'admin'] } };

    const [users, totalUsers] = await Promise.all([
      User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skipNum)
          .limit(limitNum)
          .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      data: users,
      pagination: {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        pageSize: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle ban status for a buyer or artisan
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'admin') {
       return res.status(403).json({ message: 'Cannot suspend another administrator account.' });
    }

    user.isBanned = !user.isBanned;
    await user.save();
    
    res.json({ message: `User ${user.isBanned ? 'suspended' : 'restored'} successfully`, user });
  } catch (error) {
    console.error('Error toggling ban:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch all pending applications for seller role
// @route   GET /api/admin/artisans/pending
// @access  Private/Admin
const getPendingArtisans = async (req, res) => {
  try {
    const pendingArtisans = await User.find({ role: { $in: ['artisan', 'admin'] }, status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(pendingArtisans);
  } catch (err) {
    console.error('Error fetching pending artisans:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve or Reject an artisan or admin
// @route   PUT /api/admin/artisans/:id/status
// @access  Private/Admin
const updateArtisanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active or rejected.' });
    }
    
    const artisan = await User.findById(req.params.id);
    if (!artisan) return res.status(404).json({ message: 'User not found' });
    if (!['artisan', 'admin'].includes(artisan.role)) return res.status(400).json({ message: 'User is not an artisan or admin.' });

    artisan.status = status;
    await artisan.save();
    
    res.json({ message: `Application ${status}`, artisan });
  } catch (err) {
    console.error('Error updating artisan status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const User = require('../models/User');

    const [orders, totalProducts, activeArtisans, totalBuyers] = await Promise.all([
      Order.find({}).lean(),
      Product.countDocuments({}),
      User.countDocuments({ role: 'artisan', status: 'active' }),
      User.countDocuments({ role: 'buyer' })
    ]);

    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const hastkalaEarnings = totalSales * 0.075;
    const artisanEarnings = totalSales * 0.925;
    const totalOrders = orders.length;

    // For charts: Monthly or Daily grouping could be done here, but let's mock the chart data based on overall or just simple array for now
    const revenueData = [
      { name: 'Jan', revenue: 0 },
      { name: 'Feb', revenue: 0 },
      { name: 'Mar', revenue: 0 },
      { name: 'Apr', revenue: 0 },
      { name: 'May', revenue: totalSales * 0.2 },
      { name: 'Jun', revenue: totalSales * 0.8 } // Simplified mock for the chart
    ];

    res.json({
      totalSales,
      hastkalaEarnings,
      artisanEarnings,
      totalOrders,
      totalProducts,
      activeArtisans,
      totalBuyers,
      revenueData
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  toggleBanUser,
  getPendingArtisans,
  updateArtisanStatus,
  getAdminStats
};
