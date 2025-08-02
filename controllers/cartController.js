const Cart = require('../models/Cart');
const Product = require('../models/Product');

/* ---------------------- ADD TO CART ---------------------- */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart with one item
      cart = new Cart({
        userId,
        items: [{
          productId,
          name: product.name,
          price: product.price,
          quantity
        }]
      });
    } else {
      // Check if product exists in cart
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name: product.name,
          price: product.price,
          quantity
        });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();
    res.status(201).json({ message: 'Added to cart', cart });
  } catch (err) {
    console.error('❌ Add to cart error:', err.message);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

/* ---------------------- GET CART ---------------------- */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json([]);
    }

    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      productId: item.productId,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity
    }));

    res.status(200).json(formattedItems);
  } catch (err) {
    console.error('❌ Fetch cart error:', err.message);
    res.status(500).json({ error: 'Failed to load cart' });
  }
};

/* ---------------------- UPDATE CART ITEM ---------------------- */
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Cart item updated', item });
  } catch (err) {
    console.error('❌ Update cart item error:', err.message);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

/* ---------------------- REMOVE FROM CART ---------------------- */
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('❌ Remove cart item error:', err.message);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};
