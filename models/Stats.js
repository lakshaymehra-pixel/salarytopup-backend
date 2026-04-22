const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  key: { type: String, default: 'site-stats', unique: true },
  stat1_value: { type: String, default: '5000+ Cr' },
  stat1_label: { type: String, default: 'Loan Disbursed' },
  stat2_value: { type: String, default: '25+ Lakhs' },
  stat2_label: { type: String, default: 'Loan Customers' },
  stat3_value: { type: String, default: '5+ Lakh' },
  stat3_label: { type: String, default: 'Active Users' },
  stat4_value: { type: String, default: '₹1 Lakh' },
  stat4_label: { type: String, default: 'Max. Loan Amount' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Stats', StatsSchema);
