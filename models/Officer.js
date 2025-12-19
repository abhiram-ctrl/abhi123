const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Type of officer: NDRF, Firefighter, NGO, Police, etc.
  type: { 
    type: String, 
    enum: ["NDRF", "Firefighter", "NGO", "Police", "Medical", "Other"],
    required: true 
  },
  organizationName: { type: String, default: "" },
  phone: { type: String, required: true },
  email: { type: String, default: "" },
  
  // Location for quick assignment
  location: { 
    address: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  
  // Availability status
  status: { 
    type: String, 
    enum: ["available", "assigned", "unavailable"],
    default: "available" 
  },
  
  // Skills/specializations
  skills: { type: [String], default: [] },
  
  // Vehicle/Equipment info
  vehicleType: { type: String, default: "" },
  equipmentAvailable: { type: [String], default: [] },
  
  // Assign track
  currentAssignments: [{
    incidentId: { type: String, default: null },
    riskZone: { type: String, default: "" },
    assignedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Officer", officerSchema);
