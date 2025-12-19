require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ status: 'ok' });
});

// Test forgot password
app.post('/test-otp', (req, res) => {
  console.log('Test OTP called:', req.body);
  res.json({ message: 'OTP test successful', method: req.body.method });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
});
