const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create first admin (run once)
router.post('/setup', async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Admin already exists' });
    const admin = new Admin(req.body);
    await admin.save();
    res.json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset admin password (temporary - one time use)
router.post('/reset-admin', async (req, res) => {
  try {
    const { secret, password } = req.body;
    if (secret !== 'salarytopup_reset_2024') return res.status(403).json({ message: 'Forbidden' });
    let admin = await Admin.findOne({ email: 'admin@salarytopup.com' });
    if (!admin) {
      admin = new Admin({ name: 'Admin', email: 'admin@salarytopup.com', password, role: 'admin' });
    } else {
      admin.password = password;
    }
    await admin.save();
    res.json({ message: 'Admin password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current admin
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    admin.password = newPassword;
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin profile (name + email)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findByIdAndUpdate(req.admin.id, { name, email }, { new: true }).select('-password');
    res.json(admin);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;