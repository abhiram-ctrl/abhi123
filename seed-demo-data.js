require("dotenv").config();
const mongoose = require("mongoose");
const Incident = require("./models/Incident");
const VolunteerProfile = require("./models/VolunteerProfile");
const User = require("./models/user");

async function run() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/disaster-guardian";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB:", mongoUri);

  // Ensure there is a volunteer user
  let volunteerUser = await User.findOne({ email: "volunteer@test.com" });
  if (!volunteerUser) {
    volunteerUser = await User.create({ name: "Test Volunteer", email: "volunteer@test.com", role: "volunteer" });
  }

  // Upsert a verified volunteer profile with coordinates
  const vp = await VolunteerProfile.findOneAndUpdate(
    { userId: String(volunteerUser._id) },
    {
      userId: String(volunteerUser._id),
      skills: "First Aid, Driving",
      vehicle: "Car",
      docsUrl: "",
      status: "verified",
      appliedAt: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log("VolunteerProfile:", vp._id);

  // Insert a few demo incidents if none exist
  const count = await Incident.countDocuments();
  if (count === 0) {
    const base = {
      reporterId: "demo-reporter",
      description: "Demo incident for testing",
      location: { lat: 17.3850, lng: 78.4867, address: "Hyderabad" },
      priority: "high",
      severity: "high",
      peopleInvolved: 2,
      status: "open"
    };
    await Incident.insertMany([
      { ...base, type: "SOS", emergencyType: "medical" },
      { ...base, type: "RISK", riskType: "flood" },
      { ...base, type: "SOS", emergencyType: "accident", location: { lat: 17.44, lng: 78.49, address: "Secunderabad" } }
    ]);
    console.log("Inserted demo incidents");
  } else {
    console.log("Incidents already present:", count);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
