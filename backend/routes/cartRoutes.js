// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

router.post('/add', auth, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const userId = req.user._id;
  
  try {
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product_id.equals(product_id));

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product_id, quantity });
    }

    await cart.save();
    res.json({ message: 'Added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    
    const cart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.put('/update', auth, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.product_id.equals(product_id));
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



const Order = require('../models/Order');

router.post('/order/place', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const order_items = cart.items.map(item => ({
      product_id: item.product_id._id,
      quantity: item.quantity,
      price: item.product_id.price
    }));

    const total_amount = order_items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = new Order({
      user_id: req.user._id,
      order_items,
      total_amount
    });

    await order.save();
    await Cart.deleteOne({ user_id: req.user._id });

    res.json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .populate('order_items.product_id');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;

