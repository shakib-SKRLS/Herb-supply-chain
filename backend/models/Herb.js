const mongoose = require('mongoose');

const HerbSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a herb name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  scientificName: {
    type: String,
    required: [true, 'Please add a scientific name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  benefits: {
    type: [String],
    required: [true, 'Please add at least one benefit']
  },
  growingConditions: {
    type: String,
    required: [true, 'Please add growing conditions']
  },
  harvestTime: {
    type: String,
    required: [true, 'Please add harvest time']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  labResults: [{
    type: mongoose.Schema.ObjectId,
    ref: 'LabResult'
  }],
  isOrganic: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional reference to a Farmer document for richer farmer metadata
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farmer',
  },
  batchNumber: {
    type: String,
    required: [true, 'Please add a batch number']
  },
  harvestDate: {
    type: Date,
    required: [true, 'Please add harvest date']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add expiry date']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed', 'shipped', 'out-of-stock'],
    default: 'pending'
  },
  qrCode: {
    type: String,
    unique: true
  },
  // Optional consumer reviews
  reviews: [
    {
      reviewerName: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  // Optional processor details captured post-lab processing
  processor: {
    // Link to the consumer order this processing batch is intended for (optional)
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    processorId: { type: String },
    batchNumber: { type: String },
    farmerId: { type: String },
    farmerName: { type: String },
    farmerLocation: { type: String },
    farmerPhone: { type: String },
    harvestId: { type: String },
    digitalSignature: { type: String },

    // Processing Information
    processingDate: { type: Date },
    processingType: { type: String },
    equipmentUsed: { type: String },
    processingLocation: { type: String },
    facilityCode: { type: String },

    // Quality & Safety Records
    moistureContent: { type: Number },
    cleaningStatus: { type: String },
    storageTemperature: { type: Number },
    humidity: { type: Number },
    packagingCondition: { type: String },

    // Digital Certificates
    processorSignature: { type: String },
    certificateId: { type: String },
    blockchainHash: { type: String },
    nonRepudiationRecord: { type: String },

    // Additional Information
    expiryDate: { type: Date },
    processingMethod: { type: String },
    packagingType: { type: String },
    notes: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create herb slug from the name
HerbSchema.pre('save', function(next) {
  this.qrCode = `HERB-${this._id.toString().substring(0, 8).toUpperCase()}-${this.batchNumber}`;
  next();
});

// Cascade delete lab results when a herb is deleted
HerbSchema.pre('remove', async function(next) {
  await this.model('LabResult').deleteMany({ herb: this._id });
  next();
});

// Static method to get avg price of herbs
HerbSchema.statics.getAveragePrice = async function(supplierId) {
  const obj = await this.aggregate([
    {
      $match: { supplier: supplierId }
    },
    {
      $group: {
        _id: '$supplier',
        averagePrice: { $avg: '$price' }
      }
    }
  ]);

  try {
    await this.model('User').findByIdAndUpdate(supplierId, {
      averagePrice: Math.ceil(obj[0].averagePrice / 100) * 100
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAveragePrice after save
HerbSchema.post('save', function() {
  this.constructor.getAveragePrice(this.supplier);
});

// Call getAveragePrice before remove
HerbSchema.pre('remove', function() {
  this.constructor.getAveragePrice(this.supplier);
});

module.exports = mongoose.model('Herb', HerbSchema);
