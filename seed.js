require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@disasterguardian.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    const adminUser = new User({
      name: "Admin User",
      email: "admin@disasterguardian.com",
      phone: "1234567890",
      passwordHash: passwordHash,
      role: "admin"
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@disasterguardian.com");
    console.log("Password: admin123");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdminUser();
