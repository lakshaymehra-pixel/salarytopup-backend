const router = require('express').Router();
const JobApplication = require('../models/JobApplication');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const https = require('https');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public: Submit job application with CV upload
router.post('/apply', upload.single('cv'), async (req, res) => {
  try {
    const { career_id, job_title, name, email, phone, experience, current_company, cover_letter } = req.body;

    // Phone validation
    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ Status: 0, message: 'Phone number must be exactly 10 digits.' });
    }

    let cv_url = '';
    let cv_public_id = '';

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'salarytopup/job-applications', resource_type: 'auto', use_filename: true, unique_filename: true },
          (err, result) => { if (err) reject(err); else resolve(result); }
        ).end(req.file.buffer);
      });
      cv_url = result.secure_url;
      cv_public_id = result.public_id;
    }

    const app = new JobApplication({ career_id, job_title, name, email, phone, experience, current_company, cover_letter, cv_url, cv_public_id });
    await app.save();
    res.status(201).json({ Status: 1, message: 'Application submitted successfully!' });
  } catch (err) {
    res.status(500).json({ Status: 0, message: err.message });
  }
});

// Admin: Download CV — generate signed Cloudinary URL
router.get('/download-cv/:id', auth, async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app || !app.cv_url) return res.status(404).send('CV not found');

    const axios = require('axios');
    const filename = `CV_${(app.name || 'resume').replace(/\s+/g, '_')}.pdf`;

    // Build Cloudinary signed URL using SDK
    const publicId = app.cv_public_id;
    let downloadUrl = app.cv_url;
    if (publicId) {
      downloadUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 300,
        attachment: filename,
      });
    }

    const response = await axios.get(downloadUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Admin: Get all job applications
router.get('/', auth, async (req, res) => {
  try {
    const apps = await JobApplication.find().sort({ createdAt: -1 });
    res.json({ applications: apps, total: apps.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update status
router.put('/:id', auth, async (req, res) => {
  try {
    const app = await JobApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;