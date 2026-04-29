const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isVendor, isAdmin } = require('../middleware/roleMiddleware');
const vendorStockController = require('../controllers/stockControllers/vendorStockController');
const adminStockController = require('../controllers/stockControllers/adminStockController');

// Vendor Routes
router.post('/request', authenticate, isVendor, vendorStockController.createStockRequest);
router.get('/my-requests', authenticate, isVendor, vendorStockController.getMyStockRequests);
router.get('/parts', authenticate, isVendor, vendorStockController.getAvailableParts);

// Admin Routes
router.get('/admin/all', authenticate, isAdmin, adminStockController.getAllStockRequests);
router.put('/admin/:requestId/status', authenticate, isAdmin, adminStockController.updateStockRequestStatus);

module.exports = router;
