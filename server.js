const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Force Google DNS for MongoDB SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Cloudinary global config
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/api/media', require('./routes/media'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/footer-settings', require('./routes/footer-settings'));
app.use('/api/site-settings', require('./routes/site-settings'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/keywords', require('./routes/keywords'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/careers', require('./routes/careers'));
app.use('/api/job-applications', require('./routes/job-applications'));
app.use('/api/chatbot-leads', require('./routes/chatbot-leads'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/chatbot-users', require('./routes/chatbot-users'));

// SEO routes
app.use('/api/seo/settings', require('./routes/seo-settings'));
app.use('/api/seo/dashboard', require('./routes/seo-dashboard'));
app.use('/api/seo/meta-tags', require('./routes/meta-tags'));
app.use('/api/seo/alerts', require('./routes/seo-alerts'));
app.use('/api/seo/keyword-suggestions', require('./routes/keyword-suggestions'));
app.use('/api/seo/audit', require('./routes/site-audit'));
app.use('/api/seo/gsc', require('./routes/gsc'));
app.use('/api/seo/ga', require('./routes/ga'));

// Public routes (no auth — for website frontend)
app.use('/public', require('./routes/public'));

// Health check
app.get('/', (req, res) => res.json({ message: 'SalaryTopUp Admin API Running' }));

// Blog Scheduler — check every minute and auto-publish scheduled blogs
const Blog = require('./models/Blog');
const startScheduler = () => {
  setInterval(async () => {
    // Only run if mongoose is connected (state 1 = connected)
    if (mongoose.connection.readyState !== 1) return;
    try {
      const now = new Date();
      const result = await Blog.updateMany(
        { status: 'scheduled', scheduled_at: { $lte: now } },
        { $set: { status: 'published', scheduled_at: null } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Auto-published ${result.modifiedCount} scheduled blog(s)`);
      }
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  }, 60 * 1000); // every 1 minute
};

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    startScheduler();
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('MongoDB Error:', err));