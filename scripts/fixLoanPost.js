require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Blog = require('../models/Blog');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Blog.updateOne(
    { title: /Easy Guide to Loan Apply/i },
    { $set: { category: 'Finance' } }
  );
  console.log('Updated:', result.modifiedCount, 'post(s)');
  await mongoose.disconnect();
}
fix().catch(console.error);