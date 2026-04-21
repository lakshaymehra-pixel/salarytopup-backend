const mongoose = require('mongoose');

const AuditIssueSchema = new mongoose.Schema({
  url: String,
  slug: String,
  pageTitle: String,
  type: String,
  severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'warning' },
  detail: String,
  pageType: { type: String, enum: ['blog', 'page'], default: 'page' },
  pageId: { type: mongoose.Schema.Types.ObjectId, default: null },
});

const SiteAuditSchema = new mongoose.Schema({
  runAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  issuesSummary: {
    missingMetaTitle: { type: Number, default: 0 },
    missingMetaDesc: { type: Number, default: 0 },
    missingAltText: { type: Number, default: 0 },
    duplicateMeta: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  issues: [AuditIssueSchema],
});

module.exports = mongoose.model('SiteAudit', SiteAuditSchema);