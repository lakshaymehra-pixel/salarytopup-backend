const router = require('express').Router();
const ChatbotUser = require('../models/ChatbotUser');
const auth = require('../middleware/auth');

// Admin — get all users
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.application_status = status;
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { personal_email: { $regex: search, $options: 'i' } },
        { pan_number: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await ChatbotUser.countDocuments(filter);
    const users = await ChatbotUser.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ Status: 1, data: users, total });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin — get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await ChatbotUser.findById(req.params.id);
    res.json({ Status: 1, data: user });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin — update user status
router.patch('/:id', auth, async (req, res) => {
  try {
    const user = await ChatbotUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ Status: 1, data: user });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

module.exports = router;
