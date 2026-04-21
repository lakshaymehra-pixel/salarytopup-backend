const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
CategorySchema.pre('save', async function () {
  if (!this.slug) this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
});
module.exports = mongoose.model('Category', CategorySchema);