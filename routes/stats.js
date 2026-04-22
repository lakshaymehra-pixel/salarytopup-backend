const router = require('express').Router();
const Stats = require('../models/Stats');
const auth = require('../middleware/auth');

const DEFAULTS = {
  stat1_value: '5000+ Cr',  stat1_label: 'Loan Disbursed',
  stat2_value: '25+ Lakhs', stat2_label: 'Loan Customers',
  stat3_value: '5+ Lakh',   stat3_label: 'Active Users',
  stat4_value: '₹1 Lakh',   stat4_label: 'Max. Loan Amount',
};

// Public — frontend fetches this
router.get('/public', async (req, res) => {
  try {
    const s = await Stats.findOne({ key: 'site-stats' });
    res.json(s || DEFAULTS);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get
router.get('/', auth, async (req, res) => {
  try {
    const s = await Stats.findOne({ key: 'site-stats' });
    res.json(s || DEFAULTS);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — update
router.put('/', auth, async (req, res) => {
  try {
    const s = await Stats.findOneAndUpdate(
      { key: 'site-stats' },
      { ...req.body, key: 'site-stats', updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
