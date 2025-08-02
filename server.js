const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Serve static files (public assets and uploaded files)
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ===== Import route modules =====
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const portalSettingsRoutes = require('./routes/portalSettingsRoutes');

// ===== Mount route modules =====
app.use('/api/auth', authRoutes);         // Login, Register, Auth-related
app.use('/api/products', productRoutes);  // Product CRUD
app.use('/api/customers', customerRoutes); // Admin manages customers
app.use('/api/orders', orderRoutes);      // Orders (admin & customer)
app.use('/api/cart', cartRoutes);         // Cart operations
app.use('/api/portal-settings', portalSettingsRoutes); // Portal settings & branding

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ error: '❌ Route not found' });
});

// ===== Global Error Handler (optional enhancement) =====
// app.use((err, req, res, next) => {
//   console.error('🔥 Internal Error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// ===== Start the server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
