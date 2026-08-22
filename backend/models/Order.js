const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: { type: String },
      image: { type: String },
      artisan: { type: String },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed'] },
  orderStatus: { type: String, default: 'Placed', enum: ['Placed', 'Shipped', 'Delivered', 'Cancelled'] },
  status: { type: String, default: 'pending' } // Added for frontend compatibility
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
