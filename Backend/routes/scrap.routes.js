const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isUser, isVendor, isAdmin } = require('../middleware/roleMiddleware');
const {
  createScrap,
  getMyScrap,
  getAvailableScrap,
  getMyAcceptedScrap,
  acceptScrap,
  completeScrap,
  getAllScrapAdmin,
  getScrapById
} = require('../controllers/scrapController');

// User Routes
router.post('/', authenticate, isUser, createScrap);
router.get('/my', authenticate, isUser, getMyScrap);

// Vendor Routes
router.get('/available', authenticate, isVendor, getAvailableScrap);
router.get('/my-accepted', authenticate, isVendor, getMyAcceptedScrap);
router.put('/:id/accept', authenticate, isVendor, acceptScrap);
router.put('/:id/complete', authenticate, isVendor, completeScrap);
router.get('/:id', authenticate, getScrapById);

// Admin Routes
router.get('/all', authenticate, isAdmin, getAllScrapAdmin);

module.exports = router;
