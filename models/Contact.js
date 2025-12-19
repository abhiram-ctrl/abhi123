
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // which app user owns this contact
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, default: "" },
  occupation: { type: String, default: "" },
  notifyOnSOS: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false }
});

module.exports = mongoose.model("Contact", contactSchema);
