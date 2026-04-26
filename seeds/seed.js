const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path if needed
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log("Admin already exists. Skipping seed.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        
        const admin = new User({
            name: "Super Admin",
            email: "admin@aftercommerce.com",
            password: hashedPassword,
            phone: "0000000000",
            role: "admin",
            is_onboarded: true,
            is_two_factor_enabled: false // We will set this up via UI
        });

        await admin.save();
        console.log("✅ Admin seeded successfully: admin@aftercommerce.com / Admin@123");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedAdmin();