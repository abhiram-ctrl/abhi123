const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: String,
  address: String,
  language: String,
  passwordHash: String,
  role: String, // citizen | volunteer | admin
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
