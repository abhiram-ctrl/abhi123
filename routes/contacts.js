// routes/contacts.js
const express = require("express");
const Contact = require("../models/Contact");
const router = express.Router();

// Add contact
router.post("/", async (req, res) => {
  try {
    const { userId, name, phone } = req.body;
    if (!userId || !name || !phone) {
      return res.status(400).send({ message: "userId, name and phone are required" });
    }
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send({ message: "Contact added", contact });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error adding contact" });
  }
});

// Get contacts for a user
router.get("/:userId", async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.params.userId });
    res.send(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error fetching contacts" });
  }
});

// Edit contact
router.put("/:id", async (req, res) => {
  try {
    const c = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).send({ message: "Contact not found" });
    res.send({ message: "Contact updated", contact: c });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.send({ message: "Contact deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
