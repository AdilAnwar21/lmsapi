const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  
  // Role Engine
  role: { 
    type: String, 
    enum: ['student', 'admin', 'influencer', 'staff'], 
    default: 'student' 
  },
  permissions: [{ type: String }],
  
  // Security, Preferences & 2FA
  current_refresh_token: { type: String, default: null },
  is_blocked: { type: Boolean, default: false },
  
  // --- NEW: 2FA ENGINE ---
  two_factor_secret: { type: String, default: null }, 
  is_two_factor_enabled: { type: Boolean, default: false },
  backup_codes: [{ type: String }], // E.g., ['A1B2C3D4', 'E5F6G7H8']
  // -----------------------

  notification_preferences: {
    email_reminders: { type: Boolean, default: true },
    new_courses: { type: Boolean, default: true }
  },
  
  // Referral Engine
  referral_code: { type: String, unique: true, sparse: true },
  referred_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  commission_rate: { type: Number, default: null },
  wallet_balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);



const ALL_PERMISSIONS = [
  "course:view",
  "course:create",
  "course:edit",
  "course:delete",
  "content:manage",
  "user:view",
  "user:edit",
  "user:block",
  "team:view",
  "team:create",
  "team:edit",
  "finance:view",
  "finance:payout",
  "finance:refund",
  "marketing:view",
  "marketing:edit",
  "coupon:manage",
  "community:view",
  "community:moderate",
  "settings:manage"
];