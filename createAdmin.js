require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Admin.findOne({ email: 'admin@salarytopup.com' });
  if (existing) {
    existing.password = 'Admin@2024!';
    await existing.save();
    console.log('Admin password updated!');
  } else {
    await Admin.create({ name: 'Admin', email: 'admin@salarytopup.com', password: 'Admin@2024!' });
    console.log('Admin created!');
  }
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
