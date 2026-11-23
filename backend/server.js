require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const Herb = require('./models/Herb');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const herbRoutes = require('./routes/herbs');
const orderRoutes = require('./routes/orders');
const labResultRoutes = require('./routes/labResults');
const farmerRoutes = require('./routes/farmers');
const errorHandler = require('./middleware/error');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// CORS: allow localhost on any port and include credentials. Also support preflight.
const allowedOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.some((re) => re.test(origin))) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cache-Control','Accept','Origin','X-Requested-With','Pragma']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/herb_traceability';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const { name, host } = mongoose.connection;
    console.log(`MongoDB Connected -> db: ${name}, host: ${host}`);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/health', async (req, res) => {
  try {
    const total = await Herb.countDocuments();
    const available = await Herb.countDocuments({ status: { $in: ['processed', 'shipped'] }, quantity: { $gt: 0 } });
    res.json({ success: true, status: 'ok', env: process.env.NODE_ENV || 'development', db: mongoose.connection.name, counts: { total, available } });
  } catch (e) {
    res.status(503).json({ success: false, status: 'degraded', env: process.env.NODE_ENV || 'development', db: mongoose.connection.name, error: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/herbs', herbRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/lab-results', labResultRoutes);
app.use('/api/farmers', farmerRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
