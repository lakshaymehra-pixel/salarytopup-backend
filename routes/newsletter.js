const router = require('express').Router();
const Newsletter = require('../models/Newsletter');
const auth = require('../middleware/auth');

// Public — subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      if (exists.status === 'unsubscribed') {
        exists.status = 'active';
        await exists.save();
        return res.json({ message: 'Re-subscribed successfully' });
      }
      return res.json({ message: 'Already subscribed' });
    }
    await Newsletter.create({ email });
    res.json({ message: 'Subscribed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get all subscribers
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Newsletter.countDocuments(query);
    const active = await Newsletter.countDocuments({ status: 'active' });
    const unsubscribed = await Newsletter.countDocuments({ status: 'unsubscribed' });
    const subscribers = await Newsletter.find(query).sort({ subscribedAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ subscribers, total, active, unsubscribed, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;