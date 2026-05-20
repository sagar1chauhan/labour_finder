const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
  getVendorSubCategories,
  createVendorSubCategory
} = require('../../controllers/vendorControllers/subCategoryController');

router.use(authenticate, isVendor);

router.get('/', getVendorSubCategories);
router.post('/', createVendorSubCategory);

module.exports = router;
