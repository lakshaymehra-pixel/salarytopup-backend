const router = require('express').Router();
const auth = require('../middleware/auth');
const SeoSettings = require('../models/SeoSettings');

const mask = (val) => (val && val.length > 4 ? '***' + val.slice(-4) : val ? '***' : '');

// GET settings (secrets masked)
router.get('/', auth, async (req, res) => {
  try {
    let s = await SeoSettings.findOne({ key: 'seo-settings' });
    if (!s) s = await SeoSettings.create({ key: 'seo-settings' });
    const obj = s.toObject();
    obj.gscClientSecret = mask(obj.gscClientSecret);
    obj.gscRefreshToken = mask(obj.gscRefreshToken);
    obj.gscAccessToken = mask(obj.gscAccessToken);
    obj.gaPrivateKey = mask(obj.gaPrivateKey);
    obj.openaiApiKey = mask(obj.openaiApiKey);
    obj.gscConnected = !!(s.gscRefreshToken);
    obj.gaConnected = !!(s.gaPrivateKey && s.gaPropertyId);
    obj.openaiConnected = !!(s.openaiApiKey);
    res.json(obj);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT settings (only update non-empty / non-masked values)
router.put('/', auth, async (req, res) => {
  try {
    const update = { updatedAt: Date.now() };
    const plain = ['siteUrl', 'gscClientId', 'gscSiteUrl', 'gaPropertyId', 'gaClientEmail',
      'autoSitemapEnabled', 'sitemapIncludeBlogs', 'sitemapIncludePages',
      'alertsEnabled', 'alertRankDropThreshold', 'alertMissingMeta',
      'defaultMetaTitleSuffix', 'defaultMetaDescription'];
    const secret = ['gscClientSecret', 'gscRefreshToken', 'gscAccessToken', 'gaPrivateKey', 'openaiApiKey'];

    plain.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    secret.forEach(k => {
      if (req.body[k] && !req.body[k].startsWith('***')) update[k] = req.body[k];
    });

    const s = await SeoSettings.findOneAndUpdate(
      { key: 'seo-settings' },
      update,
      { new: true, upsert: true }
    );
    res.json({ message: 'Settings saved', gscConnected: !!(s.gscRefreshToken), gaConnected: !!(s.gaPrivateKey && s.gaPropertyId), openaiConnected: !!(s.openaiApiKey) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET OAuth URL for GSC
router.get('/gsc-auth-url', auth, async (req, res) => {
  try {
    const s = await SeoSettings.findOne({ key: 'seo-settings' });
    if (!s || !s.gscClientId || !s.gscClientSecret) {
      return res.status(400).json({ message: 'Please save GSC Client ID and Client Secret first in SEO Settings.' });
    }
    const { google } = require('googleapis');
    const oauth2 = new google.auth.OAuth2(s.gscClientId, s.gscClientSecret, `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/seo/settings/gsc-callback`);
    const url = oauth2.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/webmasters.readonly'], prompt: 'consent' });
    res.json({ url });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// OAuth callback
router.get('/gsc-callback', async (req, res) => {
  try {
    const { code } = req.query;
    const s = await SeoSettings.findOne({ key: 'seo-settings' });
    if (!s) return res.status(400).send('Settings not found');
    const { google } = require('googleapis');
    const oauth2 = new google.auth.OAuth2(s.gscClientId, s.gscClientSecret, `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/seo/settings/gsc-callback`);
    const { tokens } = await oauth2.getToken(code);
    await SeoSettings.findOneAndUpdate({ key: 'seo-settings' }, {
      gscRefreshToken: tokens.refresh_token || s.gscRefreshToken,
      gscAccessToken: tokens.access_token,
      gscTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    });
    res.send('<script>window.close();</script><p>GSC connected! You can close this window.</p>');
  } catch (err) { res.status(500).send('OAuth error: ' + err.message); }
});

// Disconnect GSC
router.post('/gsc-disconnect', auth, async (req, res) => {
  try {
    await SeoSettings.findOneAndUpdate({ key: 'seo-settings' }, { gscRefreshToken: '', gscAccessToken: '', gscTokenExpiry: null });
    res.json({ message: 'GSC disconnected' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;