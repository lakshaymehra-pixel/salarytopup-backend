require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Category = require('../models/Category');
const Author = require('../models/Author');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  // Category
  const existing = await Category.findOne({ name: 'Finance' });
  if (!existing) {
    await Category.create({ name: 'Finance', slug: 'finance', description: '' });
    console.log('Created category: Finance');
  } else {
    console.log('Category Finance already exists');
  }

  // Author
  const existingAuthor = await Author.findOne({ name: 'Salary Topup Team' });
  if (!existingAuthor) {
    await Author.create({ name: 'Salary Topup Team', bio: '', avatar_url: '' });
    console.log('Created author: Salary Topup Team');
  } else {
    console.log('Author Salary Topup Team already exists');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);