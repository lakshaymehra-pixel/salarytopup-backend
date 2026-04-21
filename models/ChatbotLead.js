const mongoose = require('mongoose');

const ChatbotLeadSchema = new mongoose.Schema({
  ref_no: { type: String, unique: true },
  // Basic
  mobile: String,
  otp_consent: String,
  // PAN & Income
  pan_number: String,
  monthly_income: Number,
  // Personal
  full_name: String,
  personal_email: String,
  dob: String,
  gender: String,
  marital_status: String,
  spouse_name: String,
  // Residence
  residence_type: String,
  address_line1: String,
  address_line2: String,
  landmark: String,
  pincode: String,
  // Income
  employment_type: String,
  salary_mode: String,
  salary_date: String,
  // Loan
  loan_amount: Number,
  loan_tenure: Number,
  loan_purpose: String,
  // Employment
  work_mode: String,
  company_name: String,
  company_type: String,
  department: String,
  designation: String,
  official_email: String,
  emp_since: String,
  office_address1: String,
  office_address2: String,
  office_pincode: String,
  // Banking
  account_name: String,
  bank_name: String,
  branch_name: String,
  account_number: String,
  ifsc_code: String,
  // Status
  status: { type: String, enum: ['new', 'contacted', 'approved', 'rejected'], default: 'new' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ChatbotLead', ChatbotLeadSchema);
