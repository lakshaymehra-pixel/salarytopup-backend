const router = require('express').Router();
const Author = require('../models/Author');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Public route — get author by name (no auth)
router.get('/public', async (req, res) => {
  try {
    const author = await Author.findOne({ name: req.query.name });
    if (!author) return res.json({});
    res.json(author);
  } catch (err) { res.status(500).json({}); }
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', auth, async (req, res) => {
  try {
    const authors = await Author.find().sort({ name: 1 });
    const result = await Promise.all(authors.map(async a => {
      const count = await Blog.countDocuments({ author: a.name });
      return { ...a.toObject(), postCount: count };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const author = new Author(req.body);
    await author.save();
    res.json(author);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(author);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Author.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'salarytopup/authors', transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }] },
        (err, r) => { if (err) reject(err); else resolve(r); }
      ).end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;