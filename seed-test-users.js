const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');

async function seedTestUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/disaster-guardian');
    console.log('Connected to MongoDB');
    
    // Create citizen user
    const citizenExists = await User.findOne({ email: 'citizen@test.com' });
    if (!citizenExists) {
      const citizenHash = await bcrypt.hash('citizen123', 10);
      await User.create({
        name: 'Test Citizen',
        email: 'citizen@test.com',
        phone: '9876543210',
        passwordHash: citizenHash,
        role: 'citizen'
      });
      console.log('✅ Citizen user created (email: citizen@test.com, password: citizen123)');
    } else {
      console.log('Citizen user already exists');
    }
    
    // Create volunteer user
    const volunteerExists = await User.findOne({ email: 'volunteer@test.com' });
    if (!volunteerExists) {
      const volunteerHash = await bcrypt.hash('volunteer123', 10);
      await User.create({
        name: 'Test Volunteer',
        email: 'volunteer@test.com',
        phone: '8765432109',
        passwordHash: volunteerHash,
        role: 'volunteer'
      });
      console.log('✅ Volunteer user created (email: volunteer@test.com, password: volunteer123)');
    } else {
      console.log('Volunteer user already exists');
    }
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedTestUsers();
