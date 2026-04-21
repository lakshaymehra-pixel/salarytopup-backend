const mongoose = require('mongoose');
const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  robotsDirective: { type: String, default: 'index,follow' },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Page', PageSchema);