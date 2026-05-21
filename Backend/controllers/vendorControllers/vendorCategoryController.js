const Category = require('../../models/Category');
const { validationResult } = require('express-validator');
const { SERVICE_STATUS } = require('../../utils/constants');

/**
 * Get all categories (Vendor view)
 * GET /api/vendor/categories
 */
const getVendorCategories = async (req, res) => {
  try {
    const { status, categoryType } = req.query;
    
    // Build query - vendors can see their own categories + global categories (vendorId null/not exists)
    // AND we must exclude deleted categories
    const query = {
      status: { $ne: 'deleted' },
      $or: [
        { vendorId: req.user.id },
        { vendorId: { $exists: false } },
        { vendorId: null }
      ]
    };
    
    if (status) query.status = status;
    if (categoryType) query.categoryType = categoryType;

    const categories = await Category.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories.map(cat => ({
        id: cat._id,
        title: cat.title,
        slug: cat.slug,
        categoryType: cat.categoryType,
        imageUrl: cat.imageUrl,
        status: cat.status,
        vendorId: cat.vendorId,
        createdAt: cat.createdAt,
        isOwnCategory: cat.vendorId?.toString() === req.user.id
      }))
    });
  } catch (error) {
    console.error('Get vendor categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories. Please try again.'
    });
  }
};

/**
 * Create new category (by Vendor)
 * POST /api/vendor/categories
 */
const createVendorCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      imageUrl,
      categoryType
    } = req.body;

    let slug = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    
    // Check if slug exists, if so append a short random string to make it unique for this vendor
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Default status for vendor created category can be PENDING or ACTIVE. We'll set ACTIVE for now to not block the flow
    const category = await Category.create({
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      imageUrl: imageUrl || null,
      homeIconUrl: imageUrl || null, // Ensure icon shows on user home page
      status: SERVICE_STATUS.ACTIVE, 
      categoryType: categoryType || 'service',
      vendorId: req.user.id,
      showOnHome: true // Allow vendor categories to show on user home
    });

    // Automatically add this new category to the vendor's authorized categories
    const Vendor = require('../../models/Vendor');
    await Vendor.findByIdAndUpdate(req.user.id, {
      $addToSet: { categories: category.title, service: category.title }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: {
        id: category._id,
        title: category.title,
        slug: category.slug,
        categoryType: category.categoryType,
        imageUrl: category.imageUrl,
        status: category.status,
        vendorId: category.vendorId,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    console.error('Create vendor category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create category. Please try again.'
    });
  }
};

/**
 * Delete a vendor category
 * DELETE /api/vendor/categories/:id
 */
const deleteVendorCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Verify ownership and delete category
    const category = await Category.findOneAndDelete({ _id: id, vendorId });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or not authorized' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete vendor category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

/**
 * Update a vendor category
 * PUT /api/vendor/categories/:id
 */
const updateVendorCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const { title, description, imageUrl, categoryType } = req.body;

    const category = await Category.findOne({ _id: id, vendorId });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or not authorized' });
    }

    if (title) category.title = title.trim();
    if (description !== undefined) category.description = description?.trim() || null;
    if (imageUrl) {
      category.imageUrl = imageUrl;
      category.homeIconUrl = imageUrl;
    }
    if (categoryType) category.categoryType = categoryType;

    await category.save();

    res.status(200).json({ 
      success: true, 
      message: 'Category updated successfully',
      category: {
        id: category._id,
        title: category.title,
        slug: category.slug,
        categoryType: category.categoryType,
        imageUrl: category.imageUrl,
        status: category.status,
        vendorId: category.vendorId,
        createdAt: category.createdAt
      }
    });
  } catch (error) {
    console.error('Update vendor category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

module.exports = {
  getVendorCategories,
  createVendorCategory,
  deleteVendorCategory,
  updateVendorCategory
};
