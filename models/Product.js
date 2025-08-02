const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock_quantity: { type: Number, required: true },
  image: String, // holds filename or URL
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

module.exports = mongoose.model('Product', productSchema);
