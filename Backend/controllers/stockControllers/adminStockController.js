const StockRequest = require('../../models/StockRequest');
const Vendor = require('../../models/Vendor');

/**
 * Get all stock requests (Admin)
 */
exports.getAllStockRequests = async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;

    const requests = await StockRequest.find(query)
      .populate('vendorId', 'name businessName phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get all stock requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock requests' });
  }
};

/**
 * Update stock request status (Admin)
 */
exports.updateStockRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await StockRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    // Notify Vendor (Optional logic)
    // const { createNotification } = require('../notificationControllers/notificationController');
    // await createNotification({ ... });

    res.status(200).json({
      success: true,
      message: `Stock request ${status} successfully`,
      data: request
    });
  } catch (error) {
    console.error('Update stock request status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update request status' });
  }
};
