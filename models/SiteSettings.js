const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'site-settings', unique: true },
  siteName: { type: String, default: 'Salary Topup' },
  tagline: { type: String, default: 'Instant Pay Relief' },
  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);