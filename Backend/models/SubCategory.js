const mongoose = require('mongoose');
const { SERVICE_STATUS } = require('../utils/constants');

const subCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a sub-category title'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a parent category'],
    index: true
  },
  iconUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(SERVICE_STATUS),
    default: SERVICE_STATUS.ACTIVE,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  isVendorCreated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
subCategorySchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
