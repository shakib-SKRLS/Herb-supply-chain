const mongoose = require('mongoose');

const LabResultSchema = new mongoose.Schema({
  herb: {
    type: mongoose.Schema.ObjectId,
    ref: 'Herb',
    required: true
  },
  testedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  testResults: {
    // Contaminants
    heavyMetals: {
      lead: { type: Number, required: true }, // ppm
      mercury: { type: Number, required: true }, // ppm
      arsenic: { type: Number, required: true }, // ppm
      cadmium: { type: Number, required: true } // ppm
    },
    // Microbial Contamination
    microbial: {
      totalAerobicMicrobialCount: { type: Number, required: true }, // CFU/g
      totalYeastAndMold: { type: Number, required: true }, // CFU/g
      eColi: { type: Boolean, required: true },
      salmonella: { type: Boolean, required: true },
      staphylococcus: { type: Boolean, required: true }
    },
    // Pesticides
    pesticides: [{
      name: { type: String, required: true },
      level: { type: Number, required: true }, // ppm
      epaLimit: { type: Number, required: true } // ppm
    }],
    // Active Constituents
    activeConstituents: [{
      name: { type: String, required: true },
      percentage: { type: Number, required: true } // %
    }],
    // Other Tests
    moistureContent: { type: Number, required: true }, // %
    ashContent: { type: Number, required: true }, // %
    foreignMatter: { type: Number, required: true }, // %
    // Add more test parameters as needed
  },
  // Optional farmer metadata captured by lab during intake
  farmerName: { type: String },
  farmerLocation: { type: String },
  farmerId: { type: String },
  status: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'inconclusive'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  certificateUrl: {
    type: String
  },
  qrCode: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create QR code before saving
LabResultSchema.pre('save', function(next) {
  if (!this.qrCode) {
    this.qrCode = `LAB-${this._id.toString().substring(0, 8).toUpperCase()}`;
  }
  next();
});

// Update herb status based on lab results
LabResultSchema.post('save', async function() {
  const herb = await mongoose.model('Herb').findById(this.herb);
  if (!herb) return;

  if (this.status === 'passed') {
    herb.status = 'approved';
  } else if (this.status === 'failed') {
    herb.status = 'rejected';
  }
  
  await herb.save();

  // Auto-advance linked order status when lab result is processed
  // If a herb just passed lab tests, any pending orders containing this herb should move to 'processing'
  try {
    if (this.status === 'passed') {
      const Order = mongoose.model('Order');
      // Prefer explicit processor.orderId linkage if present
      const processorOrderId = herb?.processor?.orderId;
      if (processorOrderId) {
        await Order.updateMany(
          { _id: processorOrderId, status: 'pending' },
          { $set: { status: 'processing' } }
        );
      }
      // Also update any orders that include this herb as an item
      await Order.updateMany(
        { 'items.herb': herb._id, status: 'pending' },
        { $set: { status: 'processing' } }
      );
    }
  } catch (e) {
    console.error('Failed to auto-advance order status after lab result save:', e.message);
  }
});

// Static method to get average test results for a herb
LabResultSchema.statics.getAverageResults = async function(herbId) {
  const obj = await this.aggregate([
    {
      $match: { herb: herbId, status: 'passed' }
    },
    {
      $group: {
        _id: '$herb',
        avgMoisture: { $avg: '$testResults.moistureContent' },
        avgAsh: { $avg: '$testResults.ashContent' },
        avgForeignMatter: { $avg: '$testResults.foreignMatter' },
        testCount: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Herb').findByIdAndUpdate(herbId, {
      averageTestResults: obj[0] || {}
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageResults after save
LabResultSchema.post('save', function() {
  this.constructor.getAverageResults(this.herb);
});

// Call getAverageResults after remove
LabResultSchema.post('remove', function() {
  this.constructor.getAverageResults(this.herb);
});

module.exports = mongoose.model('LabResult', LabResultSchema);
