const StockRequest = require('../../models/StockRequest');
const VendorPartsCatalog = require('../../models/VendorPartsCatalog');
const Brand = require('../../models/Brand');

/**
 * Create a new stock request (Vendor)
 */
exports.createStockRequest = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { items, vendorNotes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide items for stock request' });
    }

    // Validate items and fetch names from both Catalog and Brands
    const validatedItems = [];
    for (const item of items) {
      let part = await VendorPartsCatalog.findById(item.partId);
      if (!part) {
        // Try finding in Brands (products)
        part = await Brand.findById(item.partId);
      }

      if (!part) {
        return res.status(404).json({ success: false, message: `Item not found: ${item.partId}` });
      }
      
      validatedItems.push({
        partId: item.partId,
        name: part.name || part.title,
        quantity: parseInt(item.quantity)
      });
    }

    const stockRequest = await StockRequest.create({
      vendorId,
      items: validatedItems,
      vendorNotes
    });

    res.status(201).json({
      success: true,
      message: 'Stock request created successfully',
      data: stockRequest
    });
  } catch (error) {
    console.error('Create stock request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create stock request' });
  }
};

/**
 * Get vendor's stock requests
 */
exports.getMyStockRequests = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const requests = await StockRequest.find({ vendorId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get my stock requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock requests' });
  }
};

/**
 * Get available parts for requesting (Including Global Parts and Vendor Products)
 */
exports.getAvailableParts = async (req, res) => {
  try {
    const [globalParts, products] = await Promise.all([
      VendorPartsCatalog.find({ status: 'active' })
        .select('name price hsnCode categoryId')
        .populate('categoryId', 'title'),
      Brand.find({ type: 'product', status: 'active' })
        .select('title basePrice categoryId')
        .populate('categoryId', 'title')
    ]);

    // Format products to match parts structure
    const formattedProducts = products.map(p => ({
      _id: p._id,
      name: p.title,
      price: p.basePrice || 0,
      categoryId: p.categoryId,
      isBrand: true
    }));

    const allAvailable = [...globalParts, ...formattedProducts];

    res.status(200).json({
      success: true,
      data: allAvailable
    });
  } catch (error) {
    console.error('Get available parts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch parts' });
  }
};
