const router = require('express').Router();
const FooterSettings = require('../models/FooterSettings');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const DEFAULTS = {
  description: 'Your trusted partner for emergency funds. We provide quick, collateral-free loans with transparent terms.',
  phone1: '+91 93557 53533',
  phone2: '+91 8448240723',
  whatsapp: '+91 8448240723',
  email: 'customercare@salarytopup.com',
  address: 'B-76, 2nd Floor, Wazirpur Industrial Area, Delhi – 110052',
  rbiText: 'RBI Registered NBFC Baid Stock Broking Services Private Limited\n(Reg. No. B-14.02553)',
  copyright: '© 2026 Salary Topup. All Right Reserved',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61574094973748',
  twitterUrl: 'https://x.com/SalaryTopup',
  instagramUrl: 'https://www.instagram.com/salary_topup',
  linkedinUrl: 'https://www.linkedin.com/company/salary-topup/',
  playstoreUrl: 'https://play.google.com/store/apps/details?id=com.salarytopup.salarytopup',
};

// Public — no auth (for website frontend)
router.get('/public', async (req, res) => {
  try {
    let settings = await FooterSettings.findOne({ key: 'footer-settings' });
    if (!settings) return res.json(DEFAULTS);
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — get settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await FooterSettings.findOne({ key: 'footer-settings' });
    if (!settings) return res.json(DEFAULTS);
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — upsert settings
router.put('/', auth, async (req, res) => {
  try {
    const settings = await FooterSettings.findOneAndUpdate(
      { key: 'footer-settings' },
      { ...req.body, key: 'footer-settings', updatedAt: Date.now() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin — upload footer logo
router.post('/upload-logo', auth, upload.single('file'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'site', public_id: 'footer-logo', overwrite: true });
    const settings = await FooterSettings.findOneAndUpdate(
      { key: 'footer-settings' },
      { logoUrl: result.secure_url, key: 'footer-settings', updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ logoUrl: settings.logoUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;