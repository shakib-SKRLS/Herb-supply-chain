const express = require('express');
const { getHerbs, getHerb, getHerbByQr, createHerb, updateHerb, deleteHerb, updateHerbProcessor } = require('../controllers/herbsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getHerbs)
  .post(protect, authorize('processor', 'admin', 'lab'), createHerb);

// QR code route must come before ":id" to prevent conflicts
router.get('/qr/:code', getHerbByQr);

router.route('/:id')
  .get(getHerb)
  .put(protect, authorize('processor', 'admin'), updateHerb)
  .delete(protect, authorize('processor', 'admin'), deleteHerb);

// Processor-specific update route
router.put('/:id/processor', protect, authorize('processor', 'admin'), updateHerbProcessor);

module.exports = router;
