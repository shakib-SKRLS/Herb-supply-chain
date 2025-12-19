const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const Herb = require('../models/Herb');
const https = require('https');

function sendTextBeeSms({ phone, message }) {
  // Allow disabling SMS from env: set SEND_SMS=false to skip
  if (String(process.env.SEND_SMS || 'true').toLowerCase() === 'false') {
    console.log('[SMS:SKIPPED] SEND_SMS=false. To enable, set SEND_SMS=true');
    return Promise.resolve({ skipped: true });
  }

  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  const apiKey = process.env.TEXTBEE_API_KEY;
  if (!deviceId || !apiKey) {
    console.warn('TextBee not configured: missing TEXTBEE_DEVICE_ID or TEXTBEE_API_KEY');
    return Promise.resolve({ skipped: true, reason: 'missing_config' });
  }
  const encodedMsg = encodeURIComponent(message);
  const encodedPhone = encodeURIComponent(phone);
  // TextBee public API format may vary; using a generic pattern. Adjust if needed.
  const url = `https://textbee.dev/api/send?key=${apiKey}&device=${deviceId}&phone=${encodedPhone}&message=${encodedMsg}`;

  console.log('[SMS:REQUEST]', { url: url.replace(apiKey, '***'), phone, message });
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          console.log('[SMS:RESPONSE]', { statusCode: res.statusCode, body: data });
          resolve({ statusCode: res.statusCode, body: data });
        });
      })
      .on('error', (err) => {
        console.error('Failed to send SMS via TextBee:', err.message);
        resolve({ error: err.message });
      });
  });
}

// @desc    Get all orders (admin) or user's orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const orders = await Order.find(filter).populate('items.herb', 'name price');
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('items.herb', 'name price');
  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }
  res.status(200).json({ success: true, data: order });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private (consumer)
exports.createOrder = asyncHandler(async (req, res) => {
  // Ensure item prices are present to satisfy schema validation
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const itemsWithPrice = await Promise.all(items.map(async (it) => {
    const herb = await Herb.findById(it.herb, 'price');
    if (!herb) throw new Error('Herb not found for order item');
    return { ...it, price: herb.price };
  }));

  const order = await Order.create({ ...req.body, items: itemsWithPrice, user: req.user._id });
  try {
    const addr = order.shippingAddress || {};
    const firstItem = Array.isArray(order.items) && order.items[0] ? order.items[0] : null;
    let herbName = '';
    let farmerPhone = process.env.FARMER_PHONE || '+917668588806';
    if (firstItem) {
      const herbDoc = await Herb.findById(firstItem.herb).lean();
      herbName = herbDoc?.name || '';
      if (herbDoc?.processor?.farmerPhone) {
        farmerPhone = herbDoc.processor.farmerPhone;
      }
    }
    const qty = firstItem ? firstItem.quantity : undefined;
    const msg = `New herb order: ${herbName ? herbName + ' - ' : ''}Qty ${qty || '?'} | Address: ${addr.address || ''}, ${addr.city || ''}, ${addr.postalCode || ''}, ${addr.country || ''}. Order #${order.orderNumber}`;
    await sendTextBeeSms({ phone: farmerPhone, message: msg });
  } catch (e) {
    console.error('Error preparing SMS:', e.message);
  }
  res.status(201).json({ success: true, data: order });
});

// @desc    Update order status (admin/processor)
// @route   PUT /api/orders/:id/status
// @access  Private (admin/processor)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorResponse('Order not found', 404));
  order.status = req.body.status || order.status;
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
  if (order.status === 'delivered') order.deliveredAt = new Date();
  await order.save();
  res.status(200).json({ success: true, data: order });
});

// @desc    Search orders by partial orderNumber (processor/admin convenience)
// @route   GET /api/orders/search?q=<term>
// @access  Private (processor/admin)
exports.searchOrders = asyncHandler(async (req, res, next) => {
  if (!['processor', 'admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to search orders', 403));
  }
  const q = String(req.query.q || '').trim();
  if (!q) {
    // If no query, return the most recent 10 orders to assist selection
    const recent = await Order.find({})
      .select('_id orderNumber status createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return res.status(200).json({ success: true, count: recent.length, data: recent });
  }
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isHexLike = /^[a-fA-F0-9]{4,24}$/.test(q);

  const queries = [{ orderNumber: { $regex: safe, $options: 'i' } }];
  if (isHexLike) {
    // Allow searching by ObjectId prefix shown in UI (first 6-8 chars)
    queries.push({ _id: { $regex: `^${q}`, $options: 'i' } });
  }

  const results = await Order.find({ $or: queries })
    .select('_id orderNumber status createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // De-duplicate by _id
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    const id = String(r._id);
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(r);
    }
  }

  res.status(200).json({ success: true, count: unique.length, data: unique });
});
