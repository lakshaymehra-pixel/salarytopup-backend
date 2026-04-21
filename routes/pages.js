const router = require('express').Router();
const Page = require('../models/Page');
const auth = require('../middleware/auth');

// Public — get page by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get all pages
router.get('/', auth, async (req, res) => {
  try {
    const pages = await Page.find().sort({ slug: 1 });
    res.json(pages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get single page
router.get('/:slug', auth, async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Not found' });
    res.json(page);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — save/update page
router.put('/:slug', auth, async (req, res) => {
  try {
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      { ...req.body, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(page);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;