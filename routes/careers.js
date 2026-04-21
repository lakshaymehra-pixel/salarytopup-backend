const router = require('express').Router();
const Career = require('../models/Career');
const auth = require('../middleware/auth');

// Get all careers (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const careers = await Career.find(query).sort({ createdAt: -1 });
    res.json({ careers, total: careers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single career
router.get('/:id', auth, async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ message: 'Not found' });
    res.json(career);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create career
router.post('/', auth, async (req, res) => {
  try {
    const career = new Career(req.body);
    await career.save();
    res.status(201).json(career);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update career
router.put('/:id', auth, async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!career) return res.status(404).json({ message: 'Not found' });
    res.json(career);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete career
router.delete('/:id', auth, async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;