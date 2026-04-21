require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Category = require('../models/Category');
const Author = require('../models/Author');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Delete ALL existing categories
  await Category.deleteMany({});
  console.log('Cleared all categories');

  // Add only Finance
  await Category.create({ name: 'Finance', slug: 'finance', description: '' });
  console.log('Created: Finance');

  // Delete ALL existing authors
  await Author.deleteMany({});
  console.log('Cleared all authors');

  // Add only SalaryTopUp Team
  await Author.create({ name: 'SalaryTopUp Team', bio: '', avatar_url: '' });
  console.log('Created: SalaryTopUp Team');

  await mongoose.disconnect();
  console.log('\nDone! Now refresh Categories and Authors pages.');
}

fix().catch(console.error);