const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_date: { type: Date, default: Date.now },
  total_amount: { type: Number, required: true },
  order_items: [orderItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
