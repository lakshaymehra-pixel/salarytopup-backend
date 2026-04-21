const router = require('express').Router();
const ChatbotLead = require('../models/ChatbotLead');
const ChatbotUser = require('../models/ChatbotUser');
const auth = require('../middleware/auth');

// Public — save lead + create/update user account
router.post('/', async (req, res) => {
  try {
    const ref = req.body.ref_no || ('STU' + Date.now().toString().slice(-6));

    // Save lead
    const lead = await ChatbotLead.create({ ...req.body, ref_no: ref });

    // Create or update user account
    await ChatbotUser.findOneAndUpdate(
      { mobile: req.body.mobile },
      { ...req.body, ref_no: ref, application_status: 'submitted' },
      { upsert: true, new: true }
    );

    res.json({ Status: 1, message: 'Application submitted', ref_no: ref, data: lead });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin — get all leads
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { personal_email: { $regex: search, $options: 'i' } },
        { ref_no: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await ChatbotLead.countDocuments(filter);
    const leads = await ChatbotLead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ Status: 1, data: leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin — get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await ChatbotLead.findById(req.params.id);
    res.json({ Status: 1, data: lead });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin — update lead status/notes
router.patch('/:id', auth, async (req, res) => {
  try {
    const lead = await ChatbotLead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ Status: 1, data: lead });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin — delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await ChatbotLead.findByIdAndDelete(req.params.id);
    res.json({ Status: 1, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

module.exports = router;
