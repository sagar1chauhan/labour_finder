const Brand = require('../../models/Brand');
const UserService = require('../../models/UserService');
const Category = require('../../models/Category');
const { validationResult } = require('express-validator');
const { SERVICE_STATUS } = require('../../utils/constants');

/**
 * Get all products (Brands/Services) created by the vendor
 * GET /api/vendors/products
 */
const getVendorProducts = async (req, res) => {
  try {
    const services = await UserService.find({ vendorId: req.user.id })
      .populate('brandId')
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: services.length,
      products: services.map(s => ({
        id: s._id,
        title: s.title,
        slug: s.brandId?.slug || '',
        iconUrl: s.iconUrl || s.brandId?.iconUrl || s.brandId?.logo,
        basePrice: s.basePrice || 0,
        discountPrice: s.discountPrice || 0,
        status: s.status,
        isPriceDisclosed: s.isPriceDisclosed ?? true,
        category: s.categoryId?.title || s.brandId?.categoryIds?.[0]?.title || 'Uncategorized',
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

/**
 * Create a new product (Brand + Default Service)
 * POST /api/vendors/products
 */
const createVendorProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, basePrice, discountPrice, iconUrl, categoryId, type, isPriceDisclosed, brandId } = req.body;

    let finalBrandId = null;
    let finalSubCategoryId = null;

    if (brandId) {
      // Check if it's a Brand or SubCategory
      const isBrand = await Brand.exists({ _id: brandId });
      if (isBrand) {
        finalBrandId = brandId;
      } else {
        // Must be a SubCategory
        finalSubCategoryId = brandId;
      }
    } else {
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`; // ensure uniqueness

      // Create the Brand (Product Group)
      const brand = await Brand.create({
        title: title.trim(),
        slug: uniqueSlug,
        categoryIds: [categoryId],
        categoryId: categoryId,
        iconUrl: iconUrl || null,
        logo: iconUrl || null,
        imageUrl: iconUrl || null,
        basePrice: Number(basePrice) || 0,
        discountPrice: Number(discountPrice) || 0,
        status: SERVICE_STATUS.ACTIVE,
        vendorId: req.user.id,
        type: type || 'service',
        isPriceDisclosed: isPriceDisclosed !== undefined ? isPriceDisclosed : true
      });
      finalBrandId = brand._id;
    }

    // Create a default Service under this Brand or SubCategory so it can be booked
    const service = await UserService.create({
      brandId: finalBrandId,
      subCategoryId: finalSubCategoryId,
      categoryId: categoryId,
      vendorId: req.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      iconUrl: iconUrl || null,
      basePrice: Number(basePrice) || 0,
      discountPrice: Number(discountPrice) || 0,
      status: SERVICE_STATUS.ACTIVE,
      type: type || 'service',
      isPriceDisclosed: isPriceDisclosed !== undefined ? isPriceDisclosed : true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: service._id,
        title: service.title,
        status: service.status
      }
    });
  } catch (error) {
    console.error('Create vendor product error:', error);
    const message = error.name === 'ValidationError' 
      ? Object.values(error.errors).map(val => val.message).join(', ')
      : 'Failed to create product.';
    res.status(400).json({ success: false, message });
  }
};

/**
 * Delete a vendor product
 * DELETE /api/vendors/products/:id
 */
const deleteVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Delete the service
    const service = await UserService.findOneAndDelete({ _id: id, vendorId });
    if (!service) {
      // Fallback: see if they try to delete by custom brand id directly
      const brand = await Brand.findOneAndDelete({ _id: id, vendorId });
      if (!brand) {
        return res.status(404).json({ success: false, message: 'Product not found or not authorized' });
      }
      await UserService.deleteMany({ brandId: id, vendorId });
    } else {
      // If it was a custom brand created by the vendor (where brand.vendorId exists), clean it up too
      await Brand.findOneAndDelete({ _id: service.brandId, vendorId });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete vendor product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

module.exports = {
  getVendorProducts,
  createVendorProduct,
  deleteVendorProduct
};
