const router = require('express').Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

// Public — get active testimonials for website
router.get('/public', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get all
router.get('/', auth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — create
router.post('/', auth, async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — update
router.put('/:id', auth, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;