const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
    getVendorCategories,
    createVendorCategory,
    deleteVendorCategory,
    updateVendorCategory
} = require('../../controllers/vendorControllers/vendorCategoryController');

const createCategoryValidation = [
    body('title').notEmpty().withMessage('Category title is required'),
    body('categoryType').optional().isIn(['service', 'product']).withMessage('Invalid category type')
];

router.get('/', authenticate, isVendor, getVendorCategories);
router.post('/', authenticate, isVendor, createCategoryValidation, createVendorCategory);
router.put('/:id', authenticate, isVendor, updateVendorCategory);
router.delete('/:id', authenticate, isVendor, deleteVendorCategory);

module.exports = router;
