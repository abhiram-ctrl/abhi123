const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    
    res.json({
      success: true,
      message: 'Donations retrieved successfully',
      data: donations,
      stats: {
        totalDonations: donations.length,
        totalAmount: totalAmount
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donations' });
  }
});

// Get donation stats
router.get('/stats', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyDonations = donations.filter(d => new Date(d.createdAt) >= currentMonth);
    const monthlyAmount = monthlyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalAmount,
        monthlyAmount,
        totalDonations: donations.length,
        completedDonations: donations.filter(d => d.status === 'completed').length,
        pendingDonations: donations.filter(d => d.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donation stats' });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    res.json({ success: true, data: donation });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donation' });
  }
});

// Create new donation
router.post('/', async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ success: false, message: 'Failed to create donation' });
  }
});

// Update donation status
router.put('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    res.json({
      success: true,
      message: 'Donation updated successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ success: false, message: 'Failed to update donation' });
  }
});

// Delete donation
router.delete('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ success: false, message: 'Failed to delete donation' });
  }
});

module.exports = router;
