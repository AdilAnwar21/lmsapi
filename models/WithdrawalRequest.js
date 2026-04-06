const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true, min: 1 },
  status: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'REJECTED'], 
    default: 'PENDING' 
  },
  
  // Payout Instructions
  payout_method: { type: String, enum: ['UPI', 'BANK_TRANSFER'], required: true },
  payout_details: { type: String, required: true }, // The UPI ID or Account Number
  
  // Admin Tracking
  admin_transaction_id: { type: String, default: null }, // GPay/Bank Ref number goes here
  processed_at: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);