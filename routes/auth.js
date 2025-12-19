const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role, address, language } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      address: address || '',
      language: language || '',
      passwordHash,
      role
    });
    await user.save();

    res.send({ message: "Signup success", id: user._id, role: user.role });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).send({ message: `${field} already registered` });
    }
    
    res.status(500).send({ message: "Signup failed: " + error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    // Check if passwordHash exists
    if (!user.passwordHash) {
      return res.status(400).send({ message: "User account has no password set" });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).send({ message: "Wrong password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    // Return response
    res.send({
      message: "Login success",
      token,
      role: user.role,
      id: user._id
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Login failed: " + error.message });
  }
});

module.exports = router;
