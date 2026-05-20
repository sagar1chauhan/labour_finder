const SubCategory = require('../../models/SubCategory');
const Category = require('../../models/Category');

/**
 * Get all sub-categories
 * GET /api/admin/sub-categories
 */
const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate('categoryId', 'title')
      .populate('vendorId', 'name businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: subCategories.length, subCategories });
  } catch (error) {
    console.error('Get sub-categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sub-categories' });
  }
};

/**
 * Create a sub-category
 * POST /api/admin/sub-categories
 */
const createSubCategory = async (req, res) => {
  try {
    const { title, categoryId, iconUrl, status } = req.body;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Parent Category not found' });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString().slice(-4); // to ensure uniqueness

    const subCategory = await SubCategory.create({
      title,
      slug,
      categoryId,
      iconUrl,
      status,
      createdBy: req.userId 
    });

    res.status(201).json({ success: true, subCategory });
  } catch (error) {
    console.error('Create sub-category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create sub-category' });
  }
};

/**
 * Update a sub-category
 * PUT /api/admin/sub-categories/:id
 */
const updateSubCategory = async (req, res) => {
  try {
    const { title, categoryId, iconUrl, status } = req.body;
    
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { title, categoryId, iconUrl, status },
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }

    res.status(200).json({ success: true, subCategory });
  } catch (error) {
    console.error('Update sub-category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update sub-category' });
  }
};

/**
 * Delete a sub-category
 * DELETE /api/admin/sub-categories/:id
 */
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }
    res.status(200).json({ success: true, message: 'Sub-category deleted successfully' });
  } catch (error) {
    console.error('Delete sub-category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sub-category' });
  }
};

module.exports = {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
};
