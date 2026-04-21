const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  career_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
  job_title: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String },
  current_company: { type: String },
  cover_letter: { type: String },
  cv_url: { type: String },
  cv_public_id: { type: String },
  status: { type: String, enum: ['new', 'reviewed', 'shortlisted', 'rejected'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);