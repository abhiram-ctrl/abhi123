const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// Get all incidents - supports filtering by reporterId
router.get('/', async (req, res) => {
  try {
    const { reporterId } = req.query;
    const query = reporterId ? { reporterId } : {};
    const incidents = await Incident.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch incidents' });
  }
});

// Get incident by ID
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.json({ success: true, data: incident });
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch incident' });
  }
});

// Create new incident
router.post('/', async (req, res) => {
  try {
    const incident = new Incident(req.body);
    await incident.save();
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ success: false, message: 'Failed to create incident' });
  }
});

// Update incident
router.put('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.json({ success: true, data: incident });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ success: false, message: 'Failed to update incident' });
  }
});

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    res.json({ success: true, message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ success: false, message: 'Failed to delete incident' });
  }
});

module.exports = router;
