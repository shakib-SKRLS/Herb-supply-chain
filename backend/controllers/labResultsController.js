const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const LabResult = require('../models/LabResult');
const Herb = require('../models/Herb');

// @desc    Get all lab results
// @route   GET /api/lab-results
// @access  Private (lab/admin)
exports.getLabResults = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { testedBy: req.user._id };
  const results = await LabResult.find(filter).populate('herb', 'name batchNumber');
  res.status(200).json({ success: true, count: results.length, data: results });
});

// @desc    Get lab result by id
// @route   GET /api/lab-results/:id
// @access  Private
exports.getLabResult = asyncHandler(async (req, res, next) => {
  const result = await LabResult.findById(req.params.id).populate('herb', 'name batchNumber');
  if (!result) return next(new ErrorResponse('Lab result not found', 404));
  if (req.user.role !== 'admin' && result.testedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to view this lab result', 403));
  }
  res.status(200).json({ success: true, data: result });
});

// @desc    Create lab result
// @route   POST /api/lab-results
// @access  Private (lab)
exports.createLabResult = asyncHandler(async (req, res, next) => {
  const herb = await Herb.findById(req.body.herb);
  if (!herb) return next(new ErrorResponse('Herb not found', 404));
  const result = await LabResult.create({ ...req.body, testedBy: req.user._id });
  // Ensure herb references this lab result for population on fetch
  await Herb.findByIdAndUpdate(herb._id, { $addToSet: { labResults: result._id } });
  res.status(201).json({ success: true, data: result });
});

// @desc    Update lab result status
// @route   PUT /api/lab-results/:id
// @access  Private (lab/admin)
exports.updateLabResult = asyncHandler(async (req, res, next) => {
  let result = await LabResult.findById(req.params.id);
  if (!result) return next(new ErrorResponse('Lab result not found', 404));
  if (req.user.role !== 'admin' && result.testedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this lab result', 403));
  }
  result = await LabResult.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  // Apply side-effects similar to LabResult post('save') because findByIdAndUpdate bypasses save middleware
  try {
    const Herb = require('../models/Herb');
    const Order = require('../models/Order');
    const herb = await Herb.findById(result.herb);
    if (herb) {
      if (result.status === 'passed') herb.status = 'approved';
      else if (result.status === 'failed') herb.status = 'rejected';
      await herb.save();

      // Auto-advance linked orders from pending -> processing upon pass
      if (result.status === 'passed') {
        const processorOrderId = herb?.processor?.orderId;
        if (processorOrderId) {
          await Order.updateMany(
            { _id: processorOrderId, status: 'pending' },
            { $set: { status: 'processing' } }
          );
        }
        await Order.updateMany(
          { 'items.herb': herb._id, status: 'pending' },
          { $set: { status: 'processing' } }
        );
      }
    }
  } catch (e) {
    console.error('Failed to apply lab result side effects:', e.message);
  }

  res.status(200).json({ success: true, data: result });
});

// @desc    Delete lab result
// @route   DELETE /api/lab-results/:id
// @access  Private (lab/admin)
exports.deleteLabResult = asyncHandler(async (req, res, next) => {
  const result = await LabResult.findById(req.params.id);
  if (!result) return next(new ErrorResponse('Lab result not found', 404));
  if (req.user.role !== 'admin' && result.testedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to delete this lab result', 403));
  }
  await result.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get latest lab result for a herb (read-only for any authenticated user)
// @route   GET /api/lab-results/herb/:herbId/latest
// @access  Private (any authenticated)
exports.getLatestLabResultForHerb = asyncHandler(async (req, res, next) => {
  const herbId = req.params.herbId;
  const herb = await Herb.findById(herbId).select('_id name batchNumber');
  if (!herb) return next(new ErrorResponse('Herb not found', 404));

  const result = await LabResult.findOne({ herb: herbId })
    .sort({ testDate: -1, createdAt: -1 })
    .select('-__v')
    .lean();

  // It's possible there are no lab results yet; return null data
  return res.status(200).json({ success: true, data: result });
});
