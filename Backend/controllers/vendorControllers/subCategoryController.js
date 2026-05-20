const SubCategory = require('../../models/SubCategory');
const Category = require('../../models/Category');
const { SERVICE_STATUS } = require('../../utils/constants');

/**
 * Get sub-categories for a vendor (both global admin created and vendor's own)
 * GET /api/vendors/sub-categories
 */
const getVendorSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = { status: SERVICE_STATUS.ACTIVE };

    // Fetch subcategories that are either global (admin created, no vendorId) OR created by this specific vendor
    query.$or = [
      { vendorId: { $exists: false } },
      { vendorId: null },
      { vendorId: req.userId }
    ];

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const subCategories = await SubCategory.find(query)
      .populate('categoryId', 'title')
      .sort({ createdAt: -1 });

    // Normalize _id to id for frontend consistency
    const normalized = subCategories.map(s => ({
      id: s._id.toString(),
      _id: s._id.toString(),
      title: s.title,
      slug: s.slug,
      iconUrl: s.iconUrl,
      categoryId: s.categoryId?._id?.toString() || s.categoryId,
      categoryTitle: s.categoryId?.title || '',
      source: 'subcategory'
    }));

    res.status(200).json({ success: true, count: normalized.length, subCategories: normalized });
  } catch (error) {
    console.error('Get vendor sub-categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sub-categories' });
  }
};

/**
 * Vendor creates a custom sub-category
 * POST /api/vendors/sub-categories
 */
const createVendorSubCategory = async (req, res) => {
  try {
    const { title, categoryId, iconUrl } = req.body;
    
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
      status: SERVICE_STATUS.ACTIVE,
      vendorId: req.userId,
      isVendorCreated: true
    });

    res.status(201).json({ success: true, subCategory });
  } catch (error) {
    console.error('Create vendor sub-category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create sub-category' });
  }
};

module.exports = {
  getVendorSubCategories,
  createVendorSubCategory
};
