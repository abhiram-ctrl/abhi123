require("dotenv").config();
const mongoose = require("mongoose");
const Incident = require("./models/Incident");
const VolunteerProfile = require("./models/VolunteerProfile");
const User = require("./models/user");

async function addLocationsToExistingData() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/disaster-guardian";
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Update incidents without coordinates
  const incidentsUpdated = await Incident.updateMany(
    {
      $or: [
        { "location.lat": { $exists: false } },
        { "location.lat": null }
      ]
    },
    {
      $set: {
        "location.lat": 17.3850,
        "location.lng": 78.4867,
        "location.address": "Hyderabad, India"
      }
    }
  );
  console.log(`📍 Updated ${incidentsUpdated.modifiedCount} incidents with default locations`);

  // Ensure all verified volunteers have user data
  const volunteers = await VolunteerProfile.find({ status: "verified" });
  console.log(`👥 Found ${volunteers.length} verified volunteers`);

  for (const vol of volunteers) {
    const user = await User.findById(vol.userId);
    if (user) {
      console.log(`   ✓ ${user.name} (${user.email})`);
    } else {
      console.log(`   ⚠️  Missing user for volunteer ${vol._id}`);
    }
  }

  await mongoose.disconnect();
  console.log("✅ Database optimization complete");
}

addLocationsToExistingData().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
