const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/* ---------------------- PLACE ORDER ---------------------- */
exports.placeOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { items, shippingAddress, billingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '❌ Order must contain at least one item' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate each item and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `❌ Product not found: ${item.productId}` });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `❌ Not enough stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Reduce stock
      product.stock_quantity -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      customerId,
      items: orderItems,
      totalAmount,
      status: 'Pending',
      shippingAddress,
      billingAddress
    });

    res.status(201).json({ 
      message: '✅ Order placed successfully!', 
      order: await order.populate('items.product', 'name price') 
    });
  } catch (error) {
    console.error('❌ Order error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ---------------------- GET MY ORDERS ---------------------- */
exports.getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { search, status, sort } = req.query;

    let query = { customerId };
    
    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add search filter for product names
    if (search) {
      query['items.product'] = {
        $in: await Product.find({
          name: { $regex: search, $options: 'i' }
        }).distinct('_id')
      };
    }

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort.startsWith('-')) {
        sortObj = { [sort.substring(1)]: -1 };
      } else {
        sortObj = { [sort]: 1 };
      }
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price image')
      .sort(sortObj);

    res.status(200).json(orders);
  } catch (err) {
    console.error('❌ Failed to get user orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

/* ---------------------- ADMIN: Get all orders ---------------------- */
exports.getOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, customer, product, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (customer) filter.customerId = customer;
    if (product) filter['items.product'] = product;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort.startsWith('-')) {
        sortObj = { [sort.substring(1)]: -1 };
      } else {
        sortObj = { [sort]: 1 };
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('customerId', 'first_name last_name email')
      .populate('items.product', 'name price')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('❌ Failed to fetch orders:', err.message);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

/* ---------------------- ADMIN: Get order by ID ---------------------- */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'first_name last_name email')
      .populate('items.product', 'name price description image');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.status(200).json(order);
  } catch (err) {
    console.error('❌ Failed to get order:', err.message);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

/* ---------------------- ADMIN: Update order ---------------------- */
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, items, shippingAddress, billingAddress } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status) order.status = status;
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (billingAddress) order.billingAddress = billingAddress;

    if (items && Array.isArray(items)) {
      // Restore previous stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock_quantity += item.quantity;
          await product.save();
        }
      }

      // Process new items
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stock_quantity < item.quantity) {
          return res.status(400).json({ error: '❌ Not enough stock to update' });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });

        // Reduce stock
        product.stock_quantity -= item.quantity;
        await product.save();
      }

      order.items = orderItems;
      order.totalAmount = totalAmount;
    }

    const updated = await order.save();
    res.status(200).json({ 
      message: '✅ Order updated', 
      order: await updated.populate('items.product', 'name price') 
    });
  } catch (err) {
    console.error('❌ Failed to update order:', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

/* ---------------------- ADMIN: Delete order ---------------------- */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock_quantity += item.quantity;
        await product.save();
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: '🗑️ Order deleted' });
  } catch (err) {
    console.error('❌ Failed to delete order:', err.message);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

/* ---------------------- ADMIN: Get order statistics ---------------------- */
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      statusBreakdown: stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error('❌ Failed to get order stats:', err.message);
    res.status(500).json({ error: 'Failed to get order statistics' });
  }
};
