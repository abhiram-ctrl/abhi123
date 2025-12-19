const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  userId: String,
  governmentId: { type: String, required: false }, // Optional field
  skills: String,
  vehicle: String,
  docsUrl: String,
  status: { type: String, default: "pending" },
  appliedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VolunteerProfile", volunteerSchema);
