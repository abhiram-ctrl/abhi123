const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// In-memory OTP storage (dev mode - replace with Redis in production)
// Key format: `${method}:${identifier}` where identifier is normalized email/phone.
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Normalize email/phone to avoid collisions and trim input noise
function normalizeIdentifier({ method, email, phone }) {
  if (method === 'email') {
    return email?.trim().toLowerCase();
  }
  if (method === 'phone') {
    return phone ? phone.toString().replace(/\D/g, '') : undefined;
  }
  return undefined;
}

function makeOtpKey({ method, identifier }) {
  return `${method}:${identifier}`;
}

// Clean up expired OTPs
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredOTPs, 60000);

// Request OTP
router.post('/request-otp', async (req, res) => {
  console.log('🔹 REQUEST RECEIVED');
  console.log('Body:', req.body);
  try {
    const { email, phone, method, role: requestedRole } = req.body;

    // Validate input
    if (!method || (method !== 'email' && method !== 'phone')) {
      console.log('❌ Invalid method');
      return res.status(400).json({ message: 'Invalid method. Must be email or phone' });
    }

    if (method === 'email' && !email) {
      console.log('❌ Email required');
      return res.status(400).json({ message: 'Email is required' });
    }

    if (method === 'phone' && !phone) {
      console.log('❌ Phone required');
      return res.status(400).json({ message: 'Phone is required' });
    }

    const identifier = normalizeIdentifier({ method, email, phone });
    if (!identifier) {
      return res.status(400).json({ message: 'Invalid identifier' });
    }

    // Find user by email or phone; guard against collisions on phone
    const query = method === 'email' ? { email: identifier } : { phone: identifier };
    console.log('🔍 Searching for user with query:', query);
    const users = await User.find(query).limit(2);
    console.log('📦 User found:', users.length);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found with provided credentials' });
    }

    if (users.length > 1) {
      return res.status(409).json({ message: 'Multiple accounts share this phone. Use your email to reset.' });
    }

    const user = users[0];

    // Optional role guard: if caller supplies role, ensure it matches stored role
    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({ message: 'Role mismatch for provided account' });
    }

    // Generate OTP
    const otp = generateOTP();
    const key = makeOtpKey({ method, identifier });

    // Store OTP with 5-minute expiry
    otpStore.set(key, {
      otp,
      userId: user._id.toString(),
      role: user.role,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      method,
      identifier
    });

    // Log OTP to console (dev mode)
    console.log('\n🔐 ===== OTP VERIFICATION CODE =====');
    console.log(`📧 Method: ${method.toUpperCase()}`);
    console.log(`👤 User: ${user.name} (${user.email}) [role=${user.role}]`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Valid for: 5 minutes`);
    console.log(`📱 Identifier: ${identifier}`);
    console.log('====================================\n');

    res.json({
      message: 'OTP sent successfully',
      method,
      identifier,
      role: user.role,
      // In dev mode, also return OTP in response (remove in production)
      devOtp: otp
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp, method } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    if (!method || (method !== 'email' && method !== 'phone')) {
      return res.status(400).json({ message: 'Invalid method' });
    }

    const identifier = normalizeIdentifier({ method, email, phone });

    if (!identifier) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }

    // Check if OTP exists
    const key = makeOtpKey({ method, identifier });
    const storedData = otpStore.get(key);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if OTP is expired
    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    console.log(`✅ OTP verified successfully for ${identifier}`);

    res.json({
      message: 'OTP verified successfully',
      verified: true,
      userId: storedData.userId,
      role: storedData.role
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, phone, otp, newPassword, method } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!method || (method !== 'email' && method !== 'phone')) {
      return res.status(400).json({ message: 'Invalid method' });
    }

    const identifier = normalizeIdentifier({ method, email, phone });

    if (!identifier) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }

    // Verify OTP one more time
    const key = makeOtpKey({ method, identifier });
    const storedData = otpStore.get(key);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find user
    const user = await User.findById(storedData.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update passwordHash field (schema uses passwordHash)
    user.passwordHash = hashedPassword;
    await user.save();

    // Delete OTP after successful reset
    otpStore.delete(key);

    console.log(`🔄 Password reset successfully for ${user.email}`);

    res.json({
      message: 'Password reset successfully',
      success: true,
      role: user.role
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// Resend OTP (same as request-otp)
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, phone, method } = req.body;

    if (!method || (method !== 'email' && method !== 'phone')) {
      return res.status(400).json({ message: 'Invalid method' });
    }

    const identifier = normalizeIdentifier({ method, email, phone });

    if (!identifier) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }

    // Delete old OTP if exists
    const key = makeOtpKey({ method, identifier });
    if (otpStore.has(key)) {
      otpStore.delete(key);
    }

    // Forward to request-otp
    req.body.method = method;
    if (method === 'email') {
      req.body.email = email;
    } else {
      req.body.phone = phone;
    }

    // Reuse request-otp logic
    const query = method === 'email' ? { email: identifier } : { phone: identifier };
    const users = await User.find(query).limit(2);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (users.length > 1) {
      return res.status(409).json({ message: 'Multiple accounts share this phone. Use your email to reset.' });
    }

    const user = users[0];

    const otp = generateOTP();

    otpStore.set(key, {
      otp,
      userId: user._id.toString(),
      role: user.role,
      expiresAt: Date.now() + 5 * 60 * 1000,
      method,
      identifier
    });

    console.log('\n🔄 ===== OTP RESENT =====');
    console.log(`📧 Method: ${method.toUpperCase()}`);
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Valid for: 5 minutes`);
    console.log('========================\n');

    res.json({
      message: 'OTP resent successfully',
      method,
      identifier,
      role: user.role,
      devOtp: otp
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
});

module.exports = router;
