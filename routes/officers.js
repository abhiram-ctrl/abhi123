const express = require("express");
const Officer = require("../models/Officer");
const Incident = require("../models/Incident");
const router = express.Router();

// GET available officers (specific route - must come BEFORE generic "/:id" routes)
router.get("/available/list", async (req, res) => {
  try {
    const { type } = req.query;
    const query = { status: { $in: ["available", "assigned"] } };
    
    if (type) query.type = type;

    const officers = await Officer.find(query).sort({ status: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: officers
    });
  } catch (err) {
    console.error('ERROR in /available/list:', err);
    res.status(500).json({ success: false, message: "Server error fetching available officers", error: err.message });
  }
});

// GET officers by type (specific route - must come BEFORE generic "/:id" routes)
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { status } = req.query;
    
    const query = { type };
    if (status) query.status = status;

    const officers = await Officer.find(query).sort({ status: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: officers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error fetching officers by type" });
  }
});

// GET all officers or filter by type and status (generic route)
router.get("/", async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;

    const officers = await Officer.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: officers
    });
  } catch (err) {
    console.error('ERROR in GET /:', err);
    res.status(500).json({ success: false, message: "Server error fetching officers", error: err.message });
  }
});

// CREATE a new officer (for seeding or admin creation)
router.post("/", async (req, res) => {
  try {
    const { name, type, organizationName, phone, email, location, skills, vehicleType, equipmentAvailable } = req.body;

    if (!name || !type || !phone) {
      return res.status(400).json({ 
        message: "name, type, and phone are required" 
      });
    }

    const officer = new Officer({
      name,
      type,
      organizationName,
      phone,
      email,
      location: location || { address: "", lat: null, lng: null },
      skills: skills || [],
      vehicleType,
      equipmentAvailable: equipmentAvailable || []
    });

    await officer.save();

    res.status(201).json({
      message: "Officer created successfully",
      officer
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error creating officer" });
  }
});

// UPDATE officer status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["available", "assigned", "unavailable"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!officer) {
      return res.status(404).send({ message: "Officer not found" });
    }

    // Real-time update
    if (req.io) {
      req.io.emit("officer-updated", officer);
    }

    res.status(200).json({
      message: "Officer status updated",
      officer
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error updating officer status" });
  }
});

// ASSIGN officer to incident at a risk zone
router.post("/:id/assign", async (req, res) => {
  try {
    const { incidentId, riskZone } = req.body;

    if (!incidentId || !riskZone) {
      return res.status(400).json({ 
        message: "incidentId and riskZone are required" 
      });
    }

    // Check if incident exists
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const officer = await Officer.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    // Add assignment to officer's current assignments
    const assignment = {
      incidentId,
      riskZone,
      assignedAt: new Date(),
      status: "active"
    };

    officer.currentAssignments.push(assignment);
    
    // If officer wasn't already assigned, change status to "assigned"
    if (officer.status === "available") {
      officer.status = "assigned";
    }
    officer.updatedAt = new Date();

    await officer.save();

    // Add officer to incident's assigned officers list
    if (!incident.assignedOfficers) {
      incident.assignedOfficers = [];
    }
    incident.assignedOfficers.push({
      officerId: officer._id,
      type: officer.type,
      name: officer.name,
      riskZone: riskZone,
      assignedAt: new Date()
    });
    await incident.save();

    // Real-time update
    if (req.io) {
      req.io.emit("officer-assigned", { officer, incident });
    }

    res.status(200).json({
      message: "Officer assigned to incident",
      officer,
      incident
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error assigning officer" });
  }
});

// UNASSIGN officer from incident
router.post("/:id/unassign", async (req, res) => {
  try {
    const { incidentId } = req.body;

    if (!incidentId) {
      return res.status(400).json({ message: "incidentId is required" });
    }

    const officer = await Officer.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    // Mark relevant assignment as cancelled
    officer.currentAssignments.forEach(assignment => {
      if (assignment.incidentId === incidentId && assignment.status === "active") {
        assignment.status = "cancelled";
      }
    });

    // If no more active assignments, mark as available
    const hasActiveAssignments = officer.currentAssignments.some(a => a.status === "active");
    if (!hasActiveAssignments) {
      officer.status = "available";
    }
    officer.updatedAt = new Date();

    await officer.save();

    // Remove officer from incident
    const incident = await Incident.findById(incidentId);
    if (incident && incident.assignedOfficers) {
      incident.assignedOfficers = incident.assignedOfficers.filter(
        o => o.officerId.toString() !== officer._id.toString()
      );
      await incident.save();
    }

    // Real-time update
    if (req.io) {
      req.io.emit("officer-unassigned", { officer, incidentId });
    }

    res.status(200).json({
      message: "Officer unassigned from incident",
      officer
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error unassigning officer" });
  }
});

// BULK ASSIGN officers to incident
router.post("/bulk/assign-to-incident", async (req, res) => {
  try {
    const { incidentId, officerIds, riskZone } = req.body;

    if (!incidentId || !officerIds || !Array.isArray(officerIds) || officerIds.length === 0) {
      return res.status(400).json({ 
        message: "incidentId and non-empty officerIds array are required" 
      });
    }

    if (!riskZone) {
      return res.status(400).json({ message: "riskZone is required" });
    }

    // Check if incident exists
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const assignedOfficers = [];

    for (const officerId of officerIds) {
      const officer = await Officer.findById(officerId);
      if (!officer) continue;

      // Add assignment
      const assignment = {
        incidentId,
        riskZone,
        assignedAt: new Date(),
        status: "active"
      };
      officer.currentAssignments.push(assignment);

      if (officer.status === "available") {
        officer.status = "assigned";
      }
      officer.updatedAt = new Date();

      await officer.save();

      assignedOfficers.push({
        officerId: officer._id,
        type: officer.type,
        name: officer.name,
        riskZone: riskZone,
        assignedAt: new Date()
      });
    }

    // Add officers to incident
    if (!incident.assignedOfficers) {
      incident.assignedOfficers = [];
    }
    incident.assignedOfficers.push(...assignedOfficers);
    await incident.save();

    // Real-time update
    if (req.io) {
      req.io.emit("officers-bulk-assigned", { assignedOfficers, incident });
    }

    res.status(200).json({
      message: `${assignedOfficers.length} officers assigned to incident`,
      assignedOfficers,
      incident
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error bulk assigning officers" });
  }
});

module.exports = router;
