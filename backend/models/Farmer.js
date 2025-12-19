const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postalCode: { type: String },
  // Geolocation
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  // Optional farm details
  farmName: { type: String },
  acreage: { type: Number },
  certifications: [String],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

FarmerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farmer', FarmerSchema);
