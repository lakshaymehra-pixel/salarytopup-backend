const mongoose = require('mongoose');

const SeoSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'seo-settings', unique: true },
  siteUrl: { type: String, default: '' },
  // Google Search Console
  gscClientId: { type: String, default: '' },
  gscClientSecret: { type: String, default: '' },
  gscRefreshToken: { type: String, default: '' },
  gscAccessToken: { type: String, default: '' },
  gscTokenExpiry: { type: Date, default: null },
  gscSiteUrl: { type: String, default: '' },
  // Google Analytics
  gaPropertyId: { type: String, default: '' },
  gaClientEmail: { type: String, default: '' },
  gaPrivateKey: { type: String, default: '' },
  // OpenAI
  openaiApiKey: { type: String, default: '' },
  // Sitemap
  sitemapLastGenerated: { type: Date, default: null },
  autoSitemapEnabled: { type: Boolean, default: true },
  sitemapIncludeBlogs: { type: Boolean, default: true },
  sitemapIncludePages: { type: Boolean, default: true },
  // Alerts
  alertsEnabled: { type: Boolean, default: true },
  alertRankDropThreshold: { type: Number, default: 5 },
  alertMissingMeta: { type: Boolean, default: true },
  // Default meta templates
  defaultMetaTitleSuffix: { type: String, default: ' | Salary Topup' },
  defaultMetaDescription: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SeoSettings', SeoSettingsSchema);