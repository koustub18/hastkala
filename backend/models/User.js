const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'artisan', 'admin'], default: 'buyer' },
  status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'active' },
  isBanned: { type: Boolean, default: false },
  // Artisan profile fields (filled during onboarding)
  location: { type: String },
  specialty: { type: String },
  upi: { type: String },
  image: { type: String, default: 'https://images.unsplash.com/photo-1620188989504-20d0f4d34cd6?q=80&w=2070&auto=format&fit=crop' },
  isVerified: { type: Boolean, default: false },
  metrics: {
    totalEarnings:      { type: Number, default: 0 },
    priceMirrorSavings: { type: Number, default: 0 },
    pendingOrders:      { type: Number, default: 0 },
    shippingToday:      { type: Number, default: 0 }
  }
}, { timestamps: true });

// ── Compound & Field Indexes for O(log n) Query Performance ──
// Optimize Admin dashboard lookups by Role and Account Status
userSchema.index({ role: 1, status: 1 });
// The email field is naturally indexed via unique: true, but we explicitly note it:
// userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);

