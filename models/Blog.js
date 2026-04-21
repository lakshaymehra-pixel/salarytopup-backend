const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { type: String, default: 'Finance' },
  author: { type: String, default: 'SalaryTopUp Team' },
  short_description: { type: String },
  long_description: { type: String },
  banner_image_url: { type: String },
  thumb_image_url: { type: String },
  status: { type: String, enum: ['published', 'draft', 'scheduled'], default: 'draft' },
  meta_title: { type: String },
  meta_description: { type: String },
  focus_keyword: { type: String },
  tags: [{ type: String }],
  image_alt: { type: String },
  faqs: [{ question: { type: String }, answer: { type: String } }],
  scheduled_at: { type: Date, default: null },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BlogSchema.pre('save', async function () {
  this.updatedAt = Date.now();
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Blog', BlogSchema);