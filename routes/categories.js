const router = require('express').Router();
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    const result = await Promise.all(cats.map(async c => {
      const count = await Blog.countDocuments({ category: c.name });
      return { ...c.toObject(), postCount: count };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const cat = new Category(req.body);
    await cat.save();
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;