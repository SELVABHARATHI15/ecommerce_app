const Product = require('../models/Product');

/* ---------------------- Get All Products (Admin) ---------------------- */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/* ---------------------- Get Public Products (Customer Dashboard) ---------------------- */
exports.getPublicProducts = async (req, res) => {
  try {
    let { page = 1, limit = 20, search = '', sort = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Build sort
    let sortObj = { created_at: -1 };
    if (sort) {
      if (sort.startsWith('-')) {
        sortObj = { [sort.substring(1)]: -1 };
      } else {
        sortObj = { [sort]: 1 };
      }
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    const products = await Product.find(query, 'name description price stock_quantity image')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('Fetching public products failed:', err);
    res.status(500).json({ error: 'Failed to fetch public products' });
  }
};

/* ---------------------- Get Recommended Products (Customer) ---------------------- */
exports.getRecommendedProducts = async (req, res) => {
  try {
    let { page = 1, limit = 20 } = req.query;

    if (limit === 'all') {
      const products = await Product.find({}, 'name description price stock_quantity image')
        .sort({ created_at: -1 });

      return res.json({
        products,
        totalPages: 1,
        currentPage: 1,
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments();

    const products = await Product.find({}, 'name description price stock_quantity image')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('Fetching recommended products failed:', err);
    res.status(500).json({ error: 'Failed to fetch recommended products' });
  }
};

/* ---------------------- Create a New Product (Admin) ---------------------- */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;
    const image = req.file ? req.file.filename : null;

    const newProduct = new Product({
      name,
      description,
      price,
      stock_quantity,
      image,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Product creation failed:', err);
    res.status(400).json({ error: 'Product creation failed' });
  }
};

/* ---------------------- Update Product (Admin) ---------------------- */
exports.updateProduct = async (req, res) => {
  try {
    const updateFields = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock_quantity: req.body.stock_quantity,
      updated_at: Date.now(),
    };

    if (req.file) {
      updateFields.image = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Product update failed:', err);
    res.status(400).json({ error: 'Product update failed' });
  }
};

/* ---------------------- Delete Product (Admin) ---------------------- */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Product deletion failed:', err);
    res.status(400).json({ error: 'Product deletion failed' });
  }
};
