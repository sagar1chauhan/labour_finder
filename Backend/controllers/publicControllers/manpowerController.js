const ManpowerCategory = require('../../models/ManpowerCategory');
const Worker = require('../../models/Worker');

/**
 * Get all active manpower categories with subcategories
 * GET /api/public/manpower-categories
 */
const getManpowerCategories = async (req, res) => {
  try {
    const categories = await ManpowerCategory.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Filter out inactive subcategories
    const filtered = categories.map(cat => ({
      ...cat,
      subCategories: (cat.subCategories || [])
        .filter(sub => sub.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }));

    res.status(200).json({
      success: true,
      categories: filtered
    });
  } catch (error) {
    console.error('Error fetching manpower categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manpower categories'
    });
  }
};

/**
 * Get public workers filtered by service category
 * GET /api/public/workers?category=Electrician&limit=20
 */
const getPublicWorkers = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};

    // Filter by service category if provided
    if (category) {
      filter.serviceCategories = { $regex: new RegExp(category, 'i') };
    }

    const workers = await Worker.find(filter)
      .select('name phone serviceCategories rating totalJobs completedJobs availability profilePhoto currentLocation serviceArea vendorId totalReviews bio packages')
      .sort({ rating: -1, completedJobs: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Worker.countDocuments(filter);

    res.status(200).json({
      success: true,
      workers: workers.map(w => ({
        id: w._id,
        name: w.name,
        type: (w.serviceCategories && w.serviceCategories[0]) || 'General',
        rating: w.rating ? `${w.rating} (${w.completedJobs || 0} jobs)` : 'New',
        experience: `${w.completedJobs || 0} Jobs Done`,
        image: w.profilePhoto || null,
        availability: w.availability || 'OFFLINE',
        serviceArea: w.serviceArea || '',
        categories: w.serviceCategories || [],
        vendorId: w.vendorId || null,
        totalReviews: w.totalReviews || 0,
        bio: w.bio || `Professional ${(w.serviceCategories && w.serviceCategories[0] || 'expert').toLowerCase()} with over ${w.completedJobs || 0} Jobs Done of dedicated field experience. Specialized in high-precision technical work.`,
        packages: w.packages && w.packages.length > 0 ? w.packages : [
          { name: 'Basic Package', price: 499, description: 'Complete service with warranty' },
          { name: 'Standard Package', price: 999, description: 'Complete service with warranty' }
        ]
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching public workers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workers'
    });
  }
};

/**
 * Get featured products grouped by category
 * GET /api/public/featured-products
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const Service = require('../../models/Service');
    const Category = require('../../models/Category');

    // Get product categories
    const productCategories = await Category.find({
      categoryType: 'product',
      status: 'active'
    }).sort({ homeOrder: 1 }).lean();

    const result = [];

    for (const cat of productCategories) {
      const services = await Service.find({
        categoryId: cat._id,
        status: 'active'
      })
        .select('title basePrice discountPrice unit iconUrl images stockWarning')
        .sort({ order: 1 })
        .limit(6)
        .lean();

      if (services.length > 0) {
        result.push({
          categoryName: cat.title,
          categoryId: cat._id,
          products: services.map(s => ({
            id: s._id,
            title: s.title,
            basePrice: s.basePrice || 0,
            discountPrice: s.discountPrice || s.basePrice || 0,
            unit: s.unit || 'piece',
            stockWarning: s.stockWarning || null,
            iconUrl: s.iconUrl || (s.images && s.images[0]) || null
          }))
        });
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

/**
 * Get vendor shops list
 * GET /api/public/shops?category=Constructor+material
 */
const getPublicShops = async (req, res) => {
  try {
    const Vendor = require('../../models/Vendor');
    const { category } = req.query;

    const filter = {
      approvalStatus: 'approved',
      isSubscriptionActive: true
    };

    if (category) {
      filter.service = { $regex: new RegExp(category, 'i') };
    }

    const vendors = await Vendor.find(filter)
      .select('name businessName service profilePhoto address rating')
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      shops: vendors.map(v => ({
        id: v._id,
        name: v.businessName || v.name,
        ownerName: v.name,
        services: v.service || [],
        image: v.profilePhoto || null,
        address: v.address ? `${v.address.addressLine1 || ''}, ${v.address.city || ''}` : '',
        rating: v.rating || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops'
    });
  }
};

module.exports = {
  getManpowerCategories,
  getPublicWorkers,
  getFeaturedProducts,
  getPublicShops
};
