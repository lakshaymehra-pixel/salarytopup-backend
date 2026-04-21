const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, default: 'General' },
  location: { type: String, default: 'Delhi' },
  type: { type: String, enum: ['Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'], default: 'Full-Time' },
  experience: { type: String, default: '0-1 years' },
  salary: { type: String, default: '' },
  openings: { type: Number, default: 1 },
  short_desc: { type: String },
  about_role: { type: String },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  nice_to_have: [{ type: String }],
  benefits: [{ type: String }],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CareerSchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('Career', CareerSchema);