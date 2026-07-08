const express = require('express');
const router = express.Router();
const {
  getManpowerCategories,
  getPublicWorkers,
  getFeaturedProducts,
  getPublicShops
} = require('../../controllers/publicControllers/manpowerController');

// Public routes — no authentication required
router.get('/manpower-categories', getManpowerCategories);
router.get('/workers', getPublicWorkers);
router.get('/featured-products', getFeaturedProducts);
router.get('/shops', getPublicShops);

module.exports = router;
