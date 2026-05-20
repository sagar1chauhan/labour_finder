const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} = require('../../controllers/adminControllers/subCategoryController');

router.use(authenticate, isAdmin);

router.get('/sub-categories', getAllSubCategories);
router.post('/sub-categories', createSubCategory);
router.put('/sub-categories/:id', updateSubCategory);
router.delete('/sub-categories/:id', deleteSubCategory);

module.exports = router;
