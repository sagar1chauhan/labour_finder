const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
} = require('../../controllers/adminControllers/subscriptionPlanController');

// All routes are protected and require admin role
router.use(authenticate, isAdmin);

router.get('/plans', getAllPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Transactions
router.get('/transactions', require('../../controllers/adminControllers/subscriptionPlanController').getTransactions);

module.exports = router;
