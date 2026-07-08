const mongoose = require('mongoose');

/**
 * ManpowerCategory Model
 * Represents Civil Work manpower categories (Engineer, Mason & Labour, Contractor, etc.)
 * These are the categories shown on the User Home page under "Manpower" section
 */
const manpowerSubCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  iconUrl: {
    type: String,
    default: null  // Cloudinary transparent PNG icon
  },
  imageUrl: {
    type: String,
    default: null  // Cloudinary category image
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const manpowerCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a category title'],
    trim: true,
    unique: true
  },
  icon: {
    type: String,
    default: '🔧'  // Emoji fallback
  },
  iconUrl: {
    type: String,
    default: null  // Cloudinary transparent PNG icon
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  subCategories: [manpowerSubCategorySchema]
}, {
  timestamps: true
});

manpowerCategorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('ManpowerCategory', manpowerCategorySchema);
