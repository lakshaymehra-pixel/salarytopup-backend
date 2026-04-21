const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String, required: true },
  loanAmount: { type: Number },
  employerName: { type: String },
  salary: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'disbursed'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);