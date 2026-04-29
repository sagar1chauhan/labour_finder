const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  items: [{
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorPartsCatalog',
      required: true
    },
    name: String, // Cached for display
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  vendorNotes: String,
  adminNotes: String,
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totalItems before saving
stockRequestSchema.pre('save', function(next) {
  if (this.items) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
  next();
});

module.exports = mongoose.model('StockRequest', stockRequestSchema);
