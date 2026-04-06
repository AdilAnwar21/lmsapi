const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Financials
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['CREATED', 'PAID', 'FAILED'], 
    default: 'CREATED' 
  },
  
  // Gateway Details (Populated by Razorpay/Stripe webhooks)
  gateway_order_id: { type: String, required: true },
  gateway_payment_id: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);