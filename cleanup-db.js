require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

const cleanupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Drop all indices on the users collection
    await User.collection.dropIndexes();
    console.log("✅ Dropped all indices");

    // Remove duplicate emails - keep only the first one
    const users = await User.find().sort({ _id: 1 });
    const seenEmails = new Set();
    const seenPhones = new Set();
    let deletedCount = 0;

    for (const user of users) {
      if (user.email && seenEmails.has(user.email)) {
        await User.deleteOne({ _id: user._id });
        console.log(`Deleted duplicate email: ${user.email}`);
        deletedCount++;
      } else if (user.email) {
        seenEmails.add(user.email);
      }

      if (user.phone && seenPhones.has(user.phone)) {
        await User.deleteOne({ _id: user._id });
        console.log(`Deleted duplicate phone: ${user.phone}`);
        deletedCount++;
      } else if (user.phone) {
        seenPhones.add(user.phone);
      }
    }

    console.log(`✅ Deleted ${deletedCount} duplicate users`);

    // Recreate indices
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("✅ Recreated email unique index");

    console.log("\n✅ Database cleanup complete!");
    console.log("You can now sign up with new credentials.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }
};

cleanupDatabase();
