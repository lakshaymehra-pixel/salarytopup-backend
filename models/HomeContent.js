const mongoose = require('mongoose');

const HomeContentSchema = new mongoose.Schema({
  key: { type: String, default: 'home-content', unique: true },

  // Hero
  hero_badge:       { type: String, default: "India's #1 Salary Loan App" },
  hero_h1_line1:    { type: String, default: 'Sahi Financial' },
  hero_h1_line2:    { type: String, default: 'Decisions se' },
  hero_h1_line3:    { type: String, default: 'Life Banegi Great' },
  hero_subheading:  { type: String, default: 'Achieve your life goals with a personalized approach to money. Instant salary loans, zero paperwork.' },
  hero_btn_text:    { type: String, default: 'Apply Now' },

  // CTA Banner
  cta_heading:      { type: String, default: 'Ready for Instant Cash?' },
  cta_subtext:      { type: String, default: 'Salary loan approved in minutes, not days.' },
  cta_btn_text:     { type: String, default: 'Check Eligibility' },

  // Why Choose
  wc_eyebrow:       { type: String, default: 'Why Choose Us' },
  wc_title_line1:   { type: String, default: "India's Most Trusted" },
  wc_title_line2:   { type: String, default: 'Salary Loan App' },
  wc_item1_title:   { type: String, default: 'Tap & Apply' },
  wc_item1_desc:    { type: String, default: 'Apply anytime, from anywhere.' },
  wc_item2_title:   { type: String, default: 'Minimal Documentation' },
  wc_item2_desc:    { type: String, default: 'Quick and paperless.' },
  wc_item3_title:   { type: String, default: 'Trusted & Verified' },
  wc_item3_desc:    { type: String, default: 'Robust data protection & regulatory adherence.' },
  wc_item4_title:   { type: String, default: 'Customer-First Approach' },
  wc_item4_desc:    { type: String, default: 'Fast support and clear communication.' },

  // Loans Section
  loans_h1:         { type: String, default: 'Every wish fulfilled.' },
  loans_h2:         { type: String, default: 'Get instant funds!' },
  loans_desc:       { type: String, default: "SalaryTopUp is India's most trusted salary loan app — built for working professionals who need quick, transparent, and hassle-free financial support between paydays." },

  // Track Section
  track_h1:         { type: String, default: 'Master your' },
  track_h2:         { type: String, default: 'money matters' },
  track_desc:       { type: String, default: 'Stay on top of your finances. Track every EMI, monitor your credit score, manage repayments — all in one place with SalaryTopUp.' },
  track_bullet1:    { type: String, default: 'Real-time EMI & repayment tracking' },
  track_bullet2:    { type: String, default: '100% secure & encrypted data' },
  track_bullet3:    { type: String, default: 'Smart reminders before due dates' },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HomeContent', HomeContentSchema);
