
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  // High-level category of incident
  // e.g., 'SOS' or 'RISK'
  type: {
    type: String,
    enum: ["SOS", "RISK"],
    required: true
  },

  // General fields
  description: { type: String, default: "" },
  // location can be an address string or an object with lat/lng/address
  location: { type: mongoose.Schema.Types.Mixed, default: null },

  // SOS-specific metadata
  emergencyType: { type: String, default: "" }, // medical | fire | crime | accident | natural | other
  priority: { type: String, default: "medium" },

  // Risk-specific metadata
  riskType: { type: String, default: "" },
  severity: { type: String, default: "medium" },
  peopleInvolved: { type: Number, default: 0 },
  estimatedRiskTime: { type: String, default: "" },
  additionalNotes: { type: String, default: "" },
  images: { type: [String], default: [] },

  // Workflow
  status: { type: String, default: "open" }, // open | assigned | resolved | closed
  assignedVolunteerId: { type: String, default: null },
  // Officers assigned by admin (NDRF, Firefighters, NGOs, etc.)
  assignedOfficers: [{
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
    type: { type: String, default: '' },
    name: { type: String, default: '' },
    riskZone: { type: String, default: '' },
    assignedAt: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date, default: null },
  notifiedContacts: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Incident", incidentSchema);
