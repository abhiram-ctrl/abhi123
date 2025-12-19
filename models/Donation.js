const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  type: { type: String, required: true, enum: ['credit-card', 'bank-transfer', 'paypal', 'resources'] },
  amount: { type: Number, required: true },
  message: { type: String, default: "" },
  anonymous: { type: Boolean, default: false },
  currency: { type: String, default: 'USD' },
  status: { type: String, default: "completed", enum: ['pending', 'completed', 'failed'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Donation", donationSchema);
