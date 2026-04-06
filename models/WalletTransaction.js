const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true }, // Positive for CREDIT, Negative for DEBIT/EXPIRED
  transaction_type: { 
    type: String, 
    enum: ['CREDIT', 'DEBIT', 'EXPIRED'], 
    required: true 
  },
  
  // Context
  description: { type: String, required: true }, // e.g., 'Referral Bonus for Course A'
  related_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);