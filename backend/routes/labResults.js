const express = require('express');
const { getLabResults, getLabResult, createLabResult, updateLabResult, deleteLabResult, getLatestLabResultForHerb } = require('../controllers/labResultsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('lab', 'admin'), getLabResults)
  .post(authorize('lab', 'admin'), createLabResult);

// Public (to any authenticated user) endpoint to fetch latest result for a herb
router.route('/herb/:herbId/latest')
  .get(getLatestLabResultForHerb);

router.route('/:id')
  .get(getLabResult)
  .put(authorize('lab', 'admin'), updateLabResult)
  .delete(authorize('lab', 'admin'), deleteLabResult);

module.exports = router;
