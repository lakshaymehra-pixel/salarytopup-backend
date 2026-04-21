const mongoose = require('mongoose');

const SeoAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['rank_drop', 'rank_rise', 'missing_meta', 'page_not_indexed', 'sitemap_error', 'keyword_opportunity', 'no_meta_title', 'no_meta_desc'],
    required: true,
  },
  severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'warning' },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SeoAlert', SeoAlertSchema);