const router = require('express').Router();
const Keyword = require('../models/Keyword');
const auth = require('../middleware/auth');

// Get all keywords
router.get('/', auth, async (req, res) => {
  try {
    const keywords = await Keyword.find().sort({ createdAt: -1 });
    res.json(keywords);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add keyword
router.post('/', auth, async (req, res) => {
  try {
    const kw = await Keyword.create(req.body);
    res.status(201).json(kw);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update rank
router.put('/:id/rank', auth, async (req, res) => {
  try {
    const { rank } = req.body;
    const kw = await Keyword.findById(req.params.id);
    if (!kw) return res.status(404).json({ message: 'Not found' });
    kw.previousRank = kw.currentRank;
    kw.currentRank = rank;
    kw.history.push({ rank, date: new Date() });
    kw.updatedAt = new Date();
    await kw.save();
    res.json(kw);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update keyword details
router.put('/:id', auth, async (req, res) => {
  try {
    const kw = await Keyword.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json(kw);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete keyword
router.delete('/:id', auth, async (req, res) => {
  try {
    await Keyword.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;