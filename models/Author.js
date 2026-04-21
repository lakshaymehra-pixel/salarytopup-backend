const mongoose = require('mongoose');
const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar_url: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Author', AuthorSchema);