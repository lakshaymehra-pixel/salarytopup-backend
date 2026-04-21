const mongoose = require('mongoose');

const MetaTagSchema = new mongoose.Schema({
  pageType: { type: String, enum: ['page', 'blog', 'custom'], default: 'custom' },
  pageId: { type: mongoose.Schema.Types.ObjectId, default: null },
  slug: { type: String, required: true, unique: true },
  pageTitle: { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  robotsDirective: { type: String, default: 'index,follow' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MetaTag', MetaTagSchema);