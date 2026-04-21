const router = require('express').Router();
const Blog = require('../models/Blog');
const Career = require('../models/Career');

// Get all published blogs
router.get('/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 100, category } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title slug category author short_description thumb_image_url banner_image_url createdAt views');
    res.json({ Status: 1, data: blogs, total });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Get single blog by slug
router.get('/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.status(404).json({ Status: 0, message: 'Blog not found' });
    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    res.json({ Status: 1, data: blog });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Get all active careers
router.get('/careers', async (req, res) => {
  try {
    const careers = await Career.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ Status: 1, data: careers });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Get single career
router.get('/careers/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ Status: 0, message: 'Not found' });
    res.json({ Status: 1, data: career });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

module.exports = router;