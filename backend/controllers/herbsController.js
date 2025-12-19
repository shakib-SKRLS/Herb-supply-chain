const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');
const Herb = require('../models/Herb');
const Order = require('../models/Order');

// @desc    Get all herbs
// @route   GET /api/herbs
// @access  Public
exports.getHerbs = asyncHandler(async (req, res) => {
  // If ?all=1 is passed, return all herbs for debugging
  const returnAll = req.query.all === '1' || req.query.all === 'true';
  const filter = returnAll
    ? {}
    : { status: { $in: ['processed', 'shipped'] }, quantity: { $gt: 0 } };

  // Optional farmer filter: /api/herbs?farmer=<farmerId>
  if (req.query.farmer) {
    filter.farmer = req.query.farmer;
  }

  const herbs = await Herb.find(filter)
    .populate('labResults')
    .populate('supplier', 'name email role')
    .populate('farmer', 'name phone email city state country location farmName certifications');
  res.status(200).json({ success: true, count: herbs.length, data: herbs });
});

// @desc    Get single herb
// @route   GET /api/herbs/:id
// @access  Public
exports.getHerb = asyncHandler(async (req, res, next) => {
  const herb = await Herb.findById(req.params.id)
    .populate('labResults')
    .populate('supplier', 'name email role')
    .populate('farmer', 'name phone email city state country location farmName certifications');
  if (!herb) return next(new ErrorResponse('Herb not found', 404));
  res.status(200).json({ success: true, data: herb });
});

// @desc    Get herb by QR code
// @route   GET /api/herbs/qr/:code
// @access  Public
exports.getHerbByQr = asyncHandler(async (req, res, next) => {
  const herb = await Herb.findOne({ qrCode: req.params.code })
    .populate('labResults')
    .populate('supplier', 'name email role')
    .populate('farmer', 'name phone email city state country location farmName certifications');
  if (!herb) return next(new ErrorResponse('Herb not found', 404));
  res.status(200).json({ success: true, data: herb });
});

// @desc    Create herb
// @route   POST /api/herbs
// @access  Private (processor/admin)
exports.createHerb = asyncHandler(async (req, res, next) => {
  // Normalize optional processor.orderId: allow either ObjectId or orderNumber
  if (req.body && req.body.processor && req.body.processor.orderId) {
    const raw = String(req.body.processor.orderId).trim();
    // If not a valid ObjectId, try resolve by orderNumber
    if (!mongoose.Types.ObjectId.isValid(raw)) {
      // Try matching by short ObjectId prefix (e.g., first 6-12 hex chars shown in UI)
      const isHexLike = /^[a-fA-F0-9]{6,24}$/.test(raw);
      let order = null;
      if (isHexLike) {
        const candidatesById = await Order.find({ _id: { $regex: `^${raw}`, $options: 'i' } })
          .select('_id orderNumber')
          .limit(5)
          .lean();
        if (candidatesById.length === 1) {
          order = candidatesById[0];
        } else if (candidatesById.length > 1) {
          return res.status(400).json({
            success: false,
            error: 'Order ID prefix is ambiguous. Please use the full Order ID or the Order Number.',
            suggestions: candidatesById.map(c => ({ id: c._id, orderNumber: c.orderNumber })),
          });
        }
      }
      // Try exact orderNumber if not found by ID prefix
      if (!order) {
        order = await Order.findOne({ orderNumber: raw }).select('_id orderNumber');
      }
      if (!order) {
        // Try case-insensitive partial match on orderNumber for convenience
        const safe = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const candidates = await Order.find({ orderNumber: { $regex: safe, $options: 'i' } })
          .select('_id orderNumber')
          .limit(5)
          .lean();
        if (candidates.length === 1) {
          order = candidates[0];
        } else if (candidates.length === 0) {
          return next(new ErrorResponse('Invalid order reference: provide a valid Order ID (ObjectId) or a known orderNumber', 400));
        } else {
          // Ambiguous input, share a few suggestions
          return res.status(400).json({
            success: false,
            error: 'Order reference is ambiguous. Please use the full Order Number or Order ID.',
            suggestions: candidates.map(c => ({ id: c._id, orderNumber: c.orderNumber }))
          });
        }
      }
      req.body.processor.orderId = order._id;
    }
  }

  const herb = await Herb.create({ ...req.body, supplier: req.user._id });
  res.status(201).json({ success: true, data: herb });
});

// @desc    Update herb
// @route   PUT /api/herbs/:id
// @access  Private (processor/admin)
exports.updateHerb = asyncHandler(async (req, res, next) => {
  let herb = await Herb.findById(req.params.id);
  if (!herb) return next(new ErrorResponse('Herb not found', 404));

  // Allow processor owner or admin
  if (req.user.role !== 'admin' && herb.supplier.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this herb', 403));
  }

  herb = await Herb.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: herb });
});

// @desc    Delete herb
// @route   DELETE /api/herbs/:id
// @access  Private (processor/admin)
exports.deleteHerb = asyncHandler(async (req, res, next) => {
  const herb = await Herb.findById(req.params.id);
  if (!herb) return next(new ErrorResponse('Herb not found', 404));

  if (req.user.role !== 'admin' && herb.supplier.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to delete this herb', 403));
  }

  await herb.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Update herb processor details
// @route   PUT /api/herbs/:id/processor
// @access  Private (processor/admin)
exports.updateHerbProcessor = asyncHandler(async (req, res, next) => {
  const herb = await Herb.findById(req.params.id);
  if (!herb) return next(new ErrorResponse('Herb not found', 404));

  // Allow admin or processor role; do not require supplier ownership
  // If non-admin, must be processor
  // Only update the 'processor' subdocument and optionally status
  const updates = { processor: req.body.processor || req.body };
  if (req.body.status) updates.status = req.body.status;

  const updated = await Herb.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updated });
});
