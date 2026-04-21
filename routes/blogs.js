const router = require('express').Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all blogs
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, category, author } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    const total = await Blog.countDocuments(query);
    const published = await Blog.countDocuments({ status: 'published' });
    const draft = await Blog.countDocuments({ status: 'draft' });
    const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ blogs, total, published, draft, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single blog
router.get('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create blog
router.post('/', auth, async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update blog
router.put('/:id', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const updateData = { ...req.body, updatedAt: Date.now() };
    // Convert scheduled_at string to proper Date object for scheduler to work
    if (updateData.scheduled_at) {
      updateData.scheduled_at = new Date(updateData.scheduled_at);
    } else {
      updateData.scheduled_at = null;
    }
    await mongoose.connection.collection('blogs').updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: updateData }
    );
    const blog = await mongoose.connection.collection('blogs').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload image
router.post('/upload/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'salarytopup/blogs' }, (err, result) => {
        if (err) reject(err); else resolve(result);
      }).end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;