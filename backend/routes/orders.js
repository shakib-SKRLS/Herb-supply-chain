const express = require('express');
const { getOrders, getOrder, createOrder, updateOrderStatus, searchOrders } = require('../controllers/ordersController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(authorize('consumer', 'admin'), createOrder);

// Order search for processors/admins to assist linking herbs to orders
router.get('/search', authorize('processor', 'admin'), searchOrders);

router.route('/:id')
  .get(getOrder);

router.route('/:id/status')
  .put(authorize('processor', 'admin'), updateOrderStatus);

module.exports = router;
