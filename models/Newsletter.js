const mongoose = require('mongoose');
const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' }
});
module.exports = mongoose.model('Newsletter', NewsletterSchema);