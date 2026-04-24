const router = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const DEFAULTS = {
  siteName: 'Salary Topup',
  tagline: 'Instant Pay Relief',
  logoUrl: '',
  faviconUrl: '',
};

// Public — for website frontend
router.get('/public', async (req, res) => {
  try {
    let s = await SiteSettings.findOne({ key: 'site-settings' });
    res.json(s || DEFAULTS);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get
router.get('/', auth, async (req, res) => {
  try {
    let s = await SiteSettings.findOne({ key: 'site-settings' });
    res.json(s || DEFAULTS);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — update text fields
router.put('/', auth, async (req, res) => {
  try {
    const s = await SiteSettings.findOneAndUpdate(
      { key: 'site-settings' },
      { ...req.body, key: 'site-settings', updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — upload logo
router.post('/upload-logo', auth, upload.single('file'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'site', public_id: 'logo', overwrite: true });
    const s = await SiteSettings.findOneAndUpdate(
      { key: 'site-settings' },
      { logoUrl: result.secure_url, key: 'site-settings', updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ logoUrl: s.logoUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — upload favicon
router.post('/upload-favicon', auth, upload.single('file'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'site', public_id: 'favicon', overwrite: true });
    const s = await SiteSettings.findOneAndUpdate(
      { key: 'site-settings' },
      { faviconUrl: result.secure_url, key: 'site-settings', updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ faviconUrl: s.faviconUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;