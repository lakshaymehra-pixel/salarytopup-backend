const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  filename: { type: String },
  title: { type: String, default: '' },
  alt_text: { type: String, default: '' },
  caption: { type: String, default: '' },
  width: { type: Number },
  height: { type: Number },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Media', MediaSchema);