const router = require('express').Router();
const Faq = require('../models/Faq');
const auth = require('../middleware/auth');

// Public — get all active FAQs (for website)
router.get('/public', async (req, res) => {
  try {
    const faqs = await Faq.find({ active: true }).sort({ group: 1, order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public — get only homepage FAQs
router.get('/public/home', async (req, res) => {
  try {
    const faqs = await Faq.find({ active: true, showOnHome: true }).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get all FAQs
router.get('/', auth, async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ group: 1, order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — seed default FAQs (only if DB is empty)
router.post('/seed', auth, async (req, res) => {
  try {
    const existing = await Faq.countDocuments();
    if (existing > 0) return res.json({ message: 'FAQs already exist, skipped seed', count: existing });

    const defaults = [
      { question: 'Who can apply for a SalaryTopUp loan?', answer: 'Any salaried individual aged 21–58 years with a minimum monthly income of ₹15,000 can apply. You need to be working with your current employer for at least 3 months.', group: 'Eligibility & Amount', order: 1, active: true, showOnHome: true },
      { question: 'How fast can I get the loan approval?', answer: 'Our AI-powered system processes applications instantly. Most loans are approved within 10 minutes and the amount is disbursed to your bank account within 30 minutes.', group: 'General', order: 2, active: true, showOnHome: true },
      { question: 'Do I need to provide any collateral?', answer: 'No, SalaryTopUp loans are completely unsecured. You don\'t need to pledge any asset or provide any collateral. Your salary is your credit.', group: 'General', order: 3, active: true, showOnHome: true },
      { question: 'What documents are required to apply?', answer: 'You just need your PAN card, Aadhaar card, and last 3 months bank statement. Everything is verified digitally — no physical documents needed.', group: 'Documents & Security', order: 4, active: true, showOnHome: true },
      { question: 'How can I repay my loan?', answer: 'You can repay via UPI, net banking, debit card, or auto-debit from your salary account. We also send reminders before the due date so you never miss a payment.', group: 'Repayment', order: 5, active: true, showOnHome: true },
      { question: 'What is the interest rate?', answer: 'Our interest rates start from 0.1% per day depending on your credit profile. There are no hidden charges — what you see is what you pay.', group: 'General', order: 6, active: true, showOnHome: true },
    ];

    await Faq.insertMany(defaults);
    res.json({ message: 'Seeded successfully', count: defaults.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — create FAQ
router.post('/', auth, async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json(faq);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — update FAQ
router.put('/:id', auth, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(faq);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — delete FAQ
router.delete('/:id', auth, async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;