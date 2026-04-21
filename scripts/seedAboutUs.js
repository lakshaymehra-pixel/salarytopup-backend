require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Page = require('../models/Page');

const ABOUT_CONTENT = `<h2>Our Story</h2><h3>Building Financial Bridges</h3><p>At SalaryTopup, we understand that financial needs can arise anytime—whether it's an emergency or a personal goal. Our journey began with a vision to make salary loans simple, fast, and accessible for salaried professionals across India. As a technology-driven NBFC, we provide a fully digital lending experience with quick approvals, minimal documentation, and transparent processes. Our mission is to remove the complexities of traditional lending and provide reliable financial support whenever it is needed.</p><h2>Our Mission</h2><h3>Empowering Your Financial Decisions</h3><p>Our mission is to simplify personal finance for salaried professionals by providing fast, flexible, and fully digital salary loans. Through advanced technology and responsible lending, we ensure quick approvals, transparent processes, and secure financial solutions that help individuals manage their financial needs with confidence.</p><h2>Our Vision</h2><h3>Leading the Future of Digital Lending</h3><p>Our vision is to become a trusted digital lending platform in India, providing salaried professionals with fast, secure, and transparent access to salary loans. By leveraging advanced technology and a customer-first approach, we aim to simplify the borrowing process and help individuals achieve their financial goals with confidence.</p>`;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await Page.findOne({ slug: 'about-us' });
  if (existing) {
    console.log('about-us page already exists, skipping seed.');
  } else {
    await Page.create({ slug: 'about-us', title: 'About Us', content: ABOUT_CONTENT });
    console.log('Seeded about-us page successfully.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });