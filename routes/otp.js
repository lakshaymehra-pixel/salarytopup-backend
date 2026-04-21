const router = require('express').Router();
const axios = require('axios');

// In-memory OTP store (use Redis in production)
const otpStore = {};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
router.post('/send', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ Status: 0, message: 'Valid 10-digit mobile number required' });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 min expiry
  otpStore[mobile] = { otp, expiry };

  try {
    await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_KEY,
        variables_values: otp,
        route: 'otp',
        numbers: mobile,
      },
    });
    console.log(`OTP sent to ${mobile}: ${otp}`);
    res.json({ Status: 1, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Fast2SMS error:', err.response?.data || err.message);
    // Still save OTP for testing even if SMS fails
    res.status(500).json({ Status: 0, message: 'SMS send failed. Check Fast2SMS balance.' });
  }
});

// Verify OTP
router.post('/verify', (req, res) => {
  const { mobile, otp } = req.body;
  const record = otpStore[mobile];

  if (!record) return res.status(400).json({ Status: 0, message: 'OTP nahi mila. Pehle send karein.' });
  if (Date.now() > record.expiry) {
    delete otpStore[mobile];
    return res.status(400).json({ Status: 0, message: 'OTP expire ho gaya. Dobara send karein.' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ Status: 0, message: 'Galat OTP. Dobara try karein.' });
  }

  delete otpStore[mobile];
  res.json({ Status: 1, message: 'OTP verified successfully' });
});

module.exports = router;
