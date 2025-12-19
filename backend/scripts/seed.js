require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Herb = require('../models/Herb');
const LabResult = require('../models/LabResult');
const Order = require('../models/Order');

const MONGODB_URI = process.env.MONGODB_URI;

async function connect() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', mongoose.connection.name);
  } catch (e) {
    console.error('Failed to connect to MongoDB:', e.message);
    process.exit(1);
  }
}

async function clear() {
  // Use deleteMany to clear collections (works with typical readWrite roles on Atlas)
  // Best-effort drop indexes to avoid old unique index conflicts
  try { await User.collection.dropIndexes(); } catch (e) { /* ignore */ }
  try { await Herb.collection.dropIndexes(); } catch (e) { /* ignore */ }
  try { await LabResult.collection.dropIndexes(); } catch (e) { /* ignore */ }
  try { await Order.collection.dropIndexes(); } catch (e) { /* ignore */ }

  await Promise.all([
    User.deleteMany({}),
    Herb.deleteMany({}),
    LabResult.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('Cleared collections and dropped indexes (best-effort).');
}

async function seed() {
  await connect();
  await clear();

  // Users (use create to trigger pre-save hooks)
  const admin = await User.create({ name: 'Admin User', email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@herbtrace.com', password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', role: 'admin' });
  const lab = await User.create({ name: 'Lab Testing Inc.', email: 'lab@example.com', password: 'password', role: 'lab' });
  const processor = await User.create({ name: 'Herb Processing Co.', email: 'processor@example.com', password: 'password', role: 'processor' });
  const consumer = await User.create({ name: 'John Consumer', email: 'consumer@example.com', password: 'password', role: 'consumer' });

  // Herbs
  const herb1 = await Herb.create({
    name: 'Turmeric',
    scientificName: 'Curcuma longa',
    description: 'Anti-inflammatory herb commonly used in Ayurveda.',
    benefits: ['Anti-inflammatory', 'Antioxidant', 'Digestive support'],
    growingConditions: 'Warm climate, well-drained soil',
    harvestTime: '8-10 months after planting',
    image: '',
    isOrganic: true,
    price: 10.5,
    quantity: 200,
    supplier: processor._id,
    batchNumber: 'BATCH-TUR-001',
    harvestDate: new Date('2025-06-01'),
    expiryDate: new Date('2026-06-01'),
    status: 'processed',
    processor: {
      processorId: 'PROC-001-2025',
      batchNumber: 'BATCH-TUR-001',
      farmerId: 'FARM-ABC-001',
      farmerName: 'ABC',
      farmerLocation: 'Nashik, MH',
      farmerPhone: '+917668588806',
      harvestId: 'HARV-TUR-001',
      digitalSignature: 'SIG-PROC-001',
      processingDate: new Date('2025-06-10'),
      processingType: 'Drying',
      equipmentUsed: 'Drying Chamber-001',
      processingLocation: 'GPS: 19.9975° N, 73.7898° E',
      facilityCode: 'FAC-NSK-001',
      moistureContent: 8.5,
      cleaningStatus: 'Completed - Sanitized',
      storageTemperature: 22.5,
      humidity: 55.2,
      packagingCondition: 'Vacuum sealed - Food grade',
      processorSignature: 'PROC-SIG-001',
      certificateId: 'CERT-PROC-TUR-001',
      blockchainHash: '0xseededblockchainhash001',
      nonRepudiationRecord: 'NRR-001',
      expiryDate: new Date('2026-06-01'),
      processingMethod: 'Traditional',
      packagingType: 'Vacuum Sealed Pouch',
      notes: 'Seeded processor details for demo.'
    },
    reviews: [
      { reviewerName: 'Aarav', rating: 5, comment: 'Excellent quality, vibrant color!' },
      { reviewerName: 'Priya', rating: 4, comment: 'Very fresh and aromatic. Will buy again.' }
    ]
  });
  const herb2 = await Herb.create({
    name: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    description: 'Adaptogenic herb used for stress relief and vitality.',
    benefits: ['Stress relief', 'Energy support', 'Cognitive health'],
    growingConditions: 'Sandy soil, warm climate',
    harvestTime: '6-7 months after planting',
    image: '',
    isOrganic: false,
    price: 15.0,
    quantity: 150,
    supplier: processor._id,
    batchNumber: 'BATCH-ASH-001',
    harvestDate: new Date('2025-05-15'),
    expiryDate: new Date('2026-05-15'),
    status: 'shipped',
    reviews: [
      { reviewerName: 'Rahul', rating: 5, comment: 'Great for stress relief, worked well for me.' },
      { reviewerName: 'Sneha', rating: 4, comment: 'Good potency and packaging.' }
    ]
  });

  // Lab Results
  const lr1 = await LabResult.create({
    herb: herb1._id,
    testedBy: lab._id,
    testDate: new Date('2025-06-15'),
    testResults: {
      heavyMetals: { lead: 0.1, mercury: 0.02, arsenic: 0.05, cadmium: 0.03 },
      microbial: { totalAerobicMicrobialCount: 1000, totalYeastAndMold: 200, eColi: false, salmonella: false, staphylococcus: false },
      pesticides: [ { name: 'Chlorpyrifos', level: 0.005, epaLimit: 0.01 } ],
      activeConstituents: [ { name: 'Curcumin', percentage: 5.0 } ],
      moistureContent: 8.5,
      ashContent: 4.2,
      foreignMatter: 0.5
    },
    status: 'passed',
    notes: 'Meets all quality standards.'
  });
  const lr2 = await LabResult.create({
    herb: herb2._id,
    testedBy: lab._id,
    testDate: new Date('2025-05-30'),
    testResults: {
      heavyMetals: { lead: 0.2, mercury: 0.01, arsenic: 0.03, cadmium: 0.02 },
      microbial: { totalAerobicMicrobialCount: 1200, totalYeastAndMold: 150, eColi: false, salmonella: false, staphylococcus: false },
      pesticides: [ { name: 'Imidacloprid', level: 0.002, epaLimit: 0.01 } ],
      activeConstituents: [ { name: 'Withanolides', percentage: 2.5 } ],
      moistureContent: 7.8,
      ashContent: 3.8,
      foreignMatter: 0.4
    },
    status: 'passed',
    notes: 'Within acceptable limits.'
  });

  // Orders
  const order = await Order.create({
    user: consumer._id,
    items: [
      { herb: herb1._id, quantity: 2, price: herb1.price },
      { herb: herb2._id, quantity: 1, price: herb2.price },
    ],
    shippingAddress: {
      address: '123 Herbal Street',
      city: 'Ayur City',
      postalCode: '12345',
      country: 'IN'
    },
    paymentMethod: 'cod',
    taxPrice: 1.5,
    shippingPrice: 2.0,
    totalPrice: 0, // will be computed in pre-save hook
    status: 'processing'
  });

  console.log('Seeded users:', { admin: admin.email, lab: lab.email, processor: processor.email, consumer: consumer.email });
  console.log('Seeded herbs:', [{ name: herb1.name, batch: herb1.batchNumber }, { name: herb2.name, batch: herb2.batchNumber }]);
  console.log('Seeded lab results:', 2);
  console.log('Seeded order:', order.orderNumber);

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
