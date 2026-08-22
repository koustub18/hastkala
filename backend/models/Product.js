const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artisan: { type: String, required: true },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  village: { type: String },
  state: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  image2: { type: String },
  artisanImage: { type: String },
  authentic: { type: Boolean, default: true },
  category: { type: String },
  material: { type: String },
  isBestseller: { type: Boolean, default: false },
  priceBreakdown: {
    artisan: { type: Number },
    platformFee: { type: Number },
    middleman: { type: Number }
  },
  stock: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
  truthMarkCode: { type: String, default: null }
}, { timestamps: true });

// ── Compound & Text Indexes for O(log n) Query Performance ──
// Boost search algorithm speed when doing $or queries across category/artisan
productSchema.index({ category: 1, artisan: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isBestseller: -1 });

// Add a generic Text Index for powerful future full-text search capabilities
productSchema.index({ title: 'text', artisan: 'text', material: 'text' });

module.exports = mongoose.model('Product', productSchema);
