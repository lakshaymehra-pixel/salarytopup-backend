const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  group: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  showOnHome: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Faq', FaqSchema);