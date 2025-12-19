// models/SmsLog.js
const mongoose = require("mongoose");

const smsLogSchema = new mongoose.Schema({
  to: String,
  message: String,
  incidentId: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, default: true } // assume success in mock
});

module.exports = mongoose.model("SmsLog", smsLogSchema);
