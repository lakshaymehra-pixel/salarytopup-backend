const router = require('express').Router();
const Media = require('../models/Media');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Get all media
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 24 } = req.query;
    const total = await Media.countDocuments();
    const items = await Media.find().sort({ uploadedAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload new image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'salarytopup/media', resource_type: 'image' },
        (err, r) => { if (err) reject(err); else resolve(r); }
      ).end(req.file.buffer);
    });

    const media = new Media({
      url: result.secure_url,
      filename: req.file.originalname,
      title: req.body.title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      alt_text: req.body.alt_text || '',
      caption: req.body.caption || '',
      width: result.width,
      height: result.height,
      size: req.file.size,
    });
    await media.save();
    res.json(media);
  } catch (err) {
    console.error('UPLOAD ERROR:', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
});

// Update media metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;