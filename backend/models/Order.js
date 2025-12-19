const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    herb: {
      type: mongoose.Schema.ObjectId,
      ref: 'Herb',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Collision-resistant order number using timestamp and random segment
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

// Calculate total price before saving
OrderSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    const populatedOrder = await this.populate('items.herb', 'price');
    this.items = populatedOrder.items.map(item => ({
      ...item.toObject(),
      price: item.herb.price
    }));
    
    const itemsPrice = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.totalPrice = itemsPrice + this.taxPrice + this.shippingPrice;
  }
  next();
});

// Update herb quantity after order is placed
OrderSchema.post('save', async function(doc) {
  if (doc.status === 'processing') {
    for (const item of doc.items) {
      await mongoose.model('Herb').findByIdAndUpdate(
        item.herb,
        { $inc: { quantity: -item.quantity } },
        { new: true, runValidators: true }
      );
    }
  }
});

module.exports = mongoose.model('Order', OrderSchema);
