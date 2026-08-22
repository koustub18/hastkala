const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Buyer
const createOrder = async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can place orders' });
    }

    const { customerInfo, items, totalAmount } = req.body;

    // --- Atomic Stock Validation and Decrement ---
    const purchasedItems = [];

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true } // Returns the updated document
      );

      if (!product) {
        // Rollback
        for (const purchased of purchasedItems) {
          await Product.findByIdAndUpdate(purchased.productId, {
            $inc: { stock: purchased.quantity }
          });
        }

        return res.status(400).json({ 
          message: `Order failed. Insufficient stock or product not found for ID: ${item.productId}` 
        });
      }
      purchasedItems.push(item);
    }

    const newOrder = new Order({
      user: req.user.id,
      customerInfo,
      items,
      totalAmount
    });
    
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/me
// @access  Private/Buyer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders
};
