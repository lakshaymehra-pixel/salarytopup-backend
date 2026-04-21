require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  const User = require('../models/User');
  const hash = await bcrypt.hash('Admin@123', 10);
  const result = await User.findOneAndUpdate(
    { email: 'admin@salarytopup.com' },
    { password: hash },
    { new: true }
  );

  if (result) {
    console.log('Password reset successful!');
    console.log('Email: admin@salarytopup.com');
    console.log('Password: Admin@123');
  } else {
    console.log('User not found!');
  }

  await mongoose.disconnect();
}

reset().catch(console.error);