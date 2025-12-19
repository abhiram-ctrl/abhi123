const express = require("express");
const Volunteer = require("../models/VolunteerProfile");
const User = require("../models/user");
const Incident = require('../models/Incident');
const router = express.Router();

// List volunteers with optional status filter (e.g., ?status=verified)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const volunteers = await Volunteer.find(query).lean();

    // Join basic user info for convenience
    const ids = volunteers.map(v => v.userId).filter(Boolean);
    const users = ids.length
      ? await User.find({ _id: { $in: ids } }, "name email phone").lean()
      : [];
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const result = volunteers.map(v => ({
      ...v,
      _id: v._id,
      name: userMap.get(String(v.userId))?.name,
      email: userMap.get(String(v.userId))?.email,
      phone: userMap.get(String(v.userId))?.phone
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Load volunteers error:", err);
    res.status(500).json({ success: false, message: "Failed to load volunteers: " + err.message });
  }
});

// Open incidents (no volunteer assigned yet)
router.get("/incidents/new", async (_req, res) => {
  try {
    const incidents = await Incident.find({
      $or: [
        { assignedVolunteerId: null },
        { assignedVolunteerId: { $exists: false } },
        { assignedVolunteerId: "" }
      ],
      status: { $in: ["open", "pending", "new"] }
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: incidents });
  } catch (err) {
    console.error("Load new incidents error:", err);
    res.status(500).json({ success: false, message: "Failed to load new incidents: " + err.message });
  }
});

// Incidents assigned to a volunteer
const assignedIncidentsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query; // optional status filter

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const query = { assignedVolunteerId: userId };
    if (status) query.status = status;

    const incidents = await Incident.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: incidents });
  } catch (err) {
    console.error("Load assigned incidents error:", err);
    res.status(500).json({ success: false, message: "Failed to load assigned incidents: " + err.message });
  }
};

router.get("/user/:userId/incidents", assignedIncidentsHandler);

// Legacy path support: /volunteers/:userId/incidents (kept for backward compatibility)
router.get("/:userId/incidents", (req, res, next) => {
  // Avoid clashing with fixed paths like /incidents/new
  if (req.params.userId === "incidents") return next();
  return assignedIncidentsHandler(req, res, next);
});

// Legacy path support: /volunteers/:userId/incidents (kept for backward compatibility)
router.get("/:userId/incidents", async (req, res, next) => {
  // Avoid clashing with /incidents/new or other fixed paths
  if (req.params.userId === "incidents" || req.params.userId === "incidents%2Fnew") {
    return next();
  }
  req.params.userId = req.params.userId; // passthrough
  return router.handle({ ...req, url: `/user/${req.params.userId}/incidents`, originalUrl: req.originalUrl }, res, next);
});

// Volunteer accepts an incident
router.post("/incidents/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({ success: false, message: "volunteerId is required" });
    }

    const incident = await Incident.findByIdAndUpdate(
      id,
      { assignedVolunteerId: volunteerId, status: "assigned" },
      { new: true, runValidators: true }
    ).lean();

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    // Notify admin dashboards or others if needed
    req.io?.emit?.("incident-updated", incident);

    return res.json({ success: true, data: incident });
  } catch (err) {
    console.error("Accept incident error:", err);
    res.status(500).json({ success: false, message: "Failed to accept incident: " + err.message });
  }
});

// Volunteer updates incident status (e.g., in-progress, resolved)
router.put("/incidents/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    const incident = await Incident.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    req.io?.emit?.("incident-updated", incident);
    return res.json({ success: true, data: incident });
  } catch (err) {
    console.error("Update incident status error:", err);
    res.status(500).json({ success: false, message: "Failed to update status: " + err.message });
  }
});

// Apply to be a volunteer - saved as pending until admin verifies
router.post("/apply", async (req, res) => {
  try {
    const { userId, skills, vehicle, docsUrl, appliedAt } = req.body;

    if (!userId || !skills) {
      return res.status(400).json({
        message: "userId and skills are required"
      });
    }

    // Upsert by userId so repeated submissions just refresh the data
    const profile = await Volunteer.findOneAndUpdate(
      { userId },
      {
        userId,
        skills,
        vehicle: vehicle || "none",
        docsUrl: docsUrl || "",
        appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
        status: "pending"
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.send({ success: true, message: "Application saved. Awaiting admin verification.", profile });
  } catch (err) {
    console.error("Volunteer apply error:", err);
    res.status(500).json({ message: "Failed to submit application: " + err.message });
  }
});

// Get single volunteer profile (joins user data for convenience)
router.get("/profile/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const profile = await Volunteer.findOne({ userId: targetUserId }).lean();
    const user = await User.findById(targetUserId).lean();

    if (!profile && !user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.send({
      success: true,
      data: {
        ...(profile || { status: "pending" }),
        name: user?.name,
        email: user?.email,
        phone: user?.phone
      }
    });
  } catch (err) {
    console.error("Profile load error:", err);
    res.status(500).json({ message: "Failed to load profile: " + err.message });
  }
});

// Pending volunteers for admin review
router.get("/pending", async (req, res) => {
  try {
    const pending = await Volunteer.find({ status: "pending" }).lean();
    const ids = pending.map(p => p.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: ids } }, "name email phone").lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));
    const result = pending.map(p => ({
      ...p,
      _id: p._id,
      name: userMap.get(String(p.userId))?.name,
      email: userMap.get(String(p.userId))?.email,
      phone: userMap.get(String(p.userId))?.phone
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Load pending volunteers error:", err);
    res.status(500).json({ success: false, message: "Failed to load pending volunteers: " + err.message });
  }
});

// Admin verification endpoint
router.put("/:id/verify", async (req, res) => {
  const { status } = req.body; // verified or rejected
  await Volunteer.findByIdAndUpdate(req.params.id, { status });
  res.send({ message: "Verification updated" });
});

// Notify volunteers with safety cautions and route info
router.post('/notify', async (req, res) => {
  try {
    const { volunteerIds = [], incidentId, message = '', safetyCautions = '', routeInfo = {} } = req.body;
    // Broadcast a socket event; clients can subscribe to 'volunteer_notification'
    req.io.emit('volunteer_notification', {
      volunteerIds,
      incidentId,
      message,
      safetyCautions,
      routeInfo,
      sentAt: new Date().toISOString()
    });
    res.send({ success: true, message: 'Notifications queued' });
  } catch (err) {
    console.error('Notify volunteers error:', err);
    res.status(500).json({ success: false, message: 'Failed to notify: ' + err.message });
  }
});
// GET single incident by ID (for volunteer detail page)
router.get('/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
