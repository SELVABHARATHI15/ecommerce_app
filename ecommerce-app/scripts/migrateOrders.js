const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Replace with your DB connection string
const MONGO_URI = 'mongodb://localhost:27017/ecommerce_db';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const orders = await Order.find({
      $or: [{ customerId: { $exists: false } }, { productId: { $exists: false } }]
    });

    console.log(`🔍 Found ${orders.length} order(s) needing migration...`);

    for (const order of orders) {
      let update = {};

      // Migrate customerId
      if (!order.customerId && order.customerEmail) {
        const user = await User.findOne({ email: order.customerEmail });
        if (user) {
          update.customerId = user._id;
          console.log(`✔ Linked user ${user.email} to order ${order._id}`);
        } else {
          console.warn(`⚠ No user found for email ${order.customerEmail} in order ${order._id}`);
        }
      }

      // Migrate productId
      if (!order.productId && order.productName) {
        const product = await Product.findOne({ name: order.productName });
        if (product) {
          update.productId = product._id;
          console.log(`✔ Linked product ${product.name} to order ${order._id}`);
        } else {
          console.warn(`⚠ No product found for name ${order.productName} in order ${order._id}`);
        }
      }

      // Apply update
      if (Object.keys(update).length > 0) {
        await Order.findByIdAndUpdate(order._id, { $set: update });
      }
    }

    console.log('✅ Migration completed.');

    // Optional: Remove deprecated fields
    const result = await Order.updateMany(
      {},
      { $unset: { customerName: "", customerEmail: "", productName: "" } }
    );
    console.log(`🧹 Removed deprecated fields from ${result.modifiedCount} order(s).`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
})();
