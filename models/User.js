const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { 
      type: String, 
      // Password is only strictly required if they are a student registering themselves
      required: function() { return this.role === 'student'; } 
  },
  is_onboarded: { 
      type: Boolean, 
      // Students are onboarded instantly. Admin/Staff must verify OTP first.
      default: function() { return this.role === 'student'; } 
  },
  phone: { type: String, required: true, unique: true },
  
  // Role Engine
  role: { 
    type: String, 
    enum: ['student', 'admin', 'influencer', 'staff'], 
    default: 'student' 
  },
  permissions: [{ type: String }],

  influencer_profile: {
    referral_code: {
      type: String,
      unique: true,
      sparse: true, 
      uppercase: true,
      trim: true
    },
    discount_percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    commission_percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    metrics: {
        total_referrals: { type: Number, default: 0 },
        total_earnings: { type: Number, default: 0 },
        pending_payout: { type: Number, default: 0 }
    }
  },
  
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