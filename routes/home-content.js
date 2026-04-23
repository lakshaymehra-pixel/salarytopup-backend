const router = require('express').Router();
const HomeContent = require('../models/HomeContent');
const auth = require('../middleware/auth');

// Public — website frontend fetches this
router.get('/public', async (req, res) => {
  try {
    const s = await HomeContent.findOne({ key: 'home-content' });
    res.json(s || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get
router.get('/', auth, async (req, res) => {
  try {
    const s = await HomeContent.findOne({ key: 'home-content' });
    res.json(s || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — update
router.put('/', auth, async (req, res) => {
  try {
    const s = await HomeContent.findOneAndUpdate(
      { key: 'home-content' },
      { ...req.body, key: 'home-content', updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
