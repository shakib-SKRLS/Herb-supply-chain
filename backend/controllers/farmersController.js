const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Farmer = require('../models/Farmer');

// @desc    Create farmer
// @route   POST /api/farmers
// @access  Private (processor/admin)
exports.createFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await Farmer.create(req.body);
  res.status(201).json({ success: true, data: farmer });
});

// @desc    Get all farmers
// @route   GET /api/farmers
// @access  Public
exports.getFarmers = asyncHandler(async (req, res, next) => {
  const farmers = await Farmer.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: farmers.length, data: farmers });
});

// @desc    Get farmer by id
// @route   GET /api/farmers/:id
// @access  Public
exports.getFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) return next(new ErrorResponse('Farmer not found', 404));
  res.status(200).json({ success: true, data: farmer });
});

// @desc    Update farmer
// @route   PUT /api/farmers/:id
// @access  Private (processor/admin)
exports.updateFarmer = asyncHandler(async (req, res, next) => {
  let farmer = await Farmer.findById(req.params.id);
  if (!farmer) return next(new ErrorResponse('Farmer not found', 404));
  farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: farmer });
});

// @desc    Delete farmer
// @route   DELETE /api/farmers/:id
// @access  Private (admin)
exports.deleteFarmer = asyncHandler(async (req, res, next) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) return next(new ErrorResponse('Farmer not found', 404));
  await farmer.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
