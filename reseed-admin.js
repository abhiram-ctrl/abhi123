require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const reseedAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete existing admin user
    const deleteResult = await User.deleteOne({ email: "admin@disasterguardian.com" });
    console.log(`Deleted ${deleteResult.deletedCount} admin user(s)`);

    // Create new admin user
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
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@disasterguardian.com");
    console.log("🔑 Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error reseeding admin user:", error);
    process.exit(1);
  }
};

reseedAdminUser();
