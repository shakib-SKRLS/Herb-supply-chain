const express = require('express');
const { createFarmer, getFarmers, getFarmer, updateFarmer, deleteFarmer } = require('../controllers/farmersController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getFarmers)
  .post(protect, authorize('processor', 'admin'), createFarmer);

router.route('/:id')
  .get(getFarmer)
  .put(protect, authorize('processor', 'admin'), updateFarmer)
  .delete(protect, authorize('admin'), deleteFarmer);

module.exports = router;
