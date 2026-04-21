const mongoose = require('mongoose');

const FooterSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'footer-settings', unique: true },
  description: { type: String, default: 'Your trusted partner for emergency funds. We provide quick, collateral-free loans with transparent terms.' },
  phone1: { type: String, default: '+91 93557 53533' },
  phone2: { type: String, default: '+91 8448240723' },
  whatsapp: { type: String, default: '+91 8448240723' },
  email: { type: String, default: 'customercare@salarytopup.com' },
  address: { type: String, default: 'B-76, 2nd Floor, Wazirpur Industrial Area, Delhi – 110052' },
  rbiText: { type: String, default: 'RBI Registered NBFC Baid Stock Broking Services Private Limited\n(Reg. No. B-14.02553)' },
  copyright: { type: String, default: '© 2026 Salary TopUp. All Right Reserved' },
  facebookUrl: { type: String, default: 'https://www.facebook.com/profile.php?id=61574094973748' },
  twitterUrl: { type: String, default: 'https://x.com/SalaryTopup' },
  instagramUrl: { type: String, default: 'https://www.instagram.com/salary_topup' },
  linkedinUrl: { type: String, default: 'https://www.linkedin.com/company/salary-topup/' },
  playstoreUrl: { type: String, default: 'https://play.google.com/store/apps/details?id=com.salarytopup.salarytopup' },
  logoUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FooterSettings', FooterSettingsSchema);