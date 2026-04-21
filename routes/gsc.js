const router = require('express').Router();
const auth = require('../middleware/auth');
const SeoSettings = require('../models/SeoSettings');
const Keyword = require('../models/Keyword');

async function getOAuth2Client() {
  const s = await SeoSettings.findOne({ key: 'seo-settings' });
  if (!s || !s.gscRefreshToken) return null;
  const { google } = require('googleapis');
  const oauth2 = new google.auth.OAuth2(s.gscClientId, s.gscClientSecret, `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/seo/settings/gsc-callback`);
  oauth2.setCredentials({ refresh_token: s.gscRefreshToken, access_token: s.gscAccessToken });
  return { oauth2, siteUrl: s.gscSiteUrl };
}

// GET keyword (query) data from GSC
router.get('/keywords', auth, async (req, res) => {
  try {
    const client = await getOAuth2Client();
    if (!client) return res.json({ configured: false, message: 'GSC not configured. Go to SEO Settings → Google Search Console.' });

    const { days = 28 } = req.query;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    const { google } = require('googleapis');
    const sc = google.webmasters({ version: 'v3', auth: client.oauth2 });

    const resp = await sc.searchanalytics.query({
      siteUrl: client.siteUrl,
      requestBody: {
        startDate, endDate,
        dimensions: ['query'],
        rowLimit: 500,
        dataState: 'all',
      },
    });

    const rows = resp.data.rows || [];

    // Sync into Keyword documents
    let synced = 0;
    for (const row of rows) {
      const kw = row.keys[0];
      const existing = await Keyword.findOne({ keyword: kw });
      const update = {
        gscImpressions: Math.round(row.impressions || 0),
        gscClicks: Math.round(row.clicks || 0),
        gscCtr: parseFloat((row.ctr * 100).toFixed(2)),
        gscPosition: parseFloat((row.position || 0).toFixed(1)),
        gscLastSync: new Date(),
        updatedAt: new Date(),
      };
      if (existing) {
        update.previousRank = existing.currentRank;
        update.currentRank = Math.round(row.position);
        await Keyword.findByIdAndUpdate(existing._id, update);
      } else {
        await Keyword.create({ keyword: kw, currentRank: Math.round(row.position), ...update });
      }
      synced++;
    }

    res.json({ rows, synced, startDate, endDate });
  } catch (err) {
    if (err.code === 401 || err.message?.includes('invalid_grant')) {
      return res.status(401).json({ configured: false, message: 'GSC token expired. Please reconnect in SEO Settings.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET page performance from GSC
router.get('/pages', auth, async (req, res) => {
  try {
    const client = await getOAuth2Client();
    if (!client) return res.json({ configured: false, message: 'GSC not configured.' });

    const { days = 28 } = req.query;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    const { google } = require('googleapis');
    const sc = google.webmasters({ version: 'v3', auth: client.oauth2 });

    const resp = await sc.searchanalytics.query({
      siteUrl: client.siteUrl,
      requestBody: { startDate, endDate, dimensions: ['page'], rowLimit: 200, dataState: 'all' },
    });

    res.json({ rows: resp.data.rows || [], startDate, endDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET summary metrics
router.get('/summary', auth, async (req, res) => {
  try {
    const client = await getOAuth2Client();
    if (!client) return res.json({ configured: false });

    const { days = 28 } = req.query;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    const { google } = require('googleapis');
    const sc = google.webmasters({ version: 'v3', auth: client.oauth2 });

    const [summary, daily] = await Promise.all([
      sc.searchanalytics.query({ siteUrl: client.siteUrl, requestBody: { startDate, endDate, dimensions: ['date'], rowLimit: 90, dataState: 'all' } }),
    ]);

    const rows = summary.data.rows || [];
    const totals = rows.reduce((acc, r) => ({
      clicks: acc.clicks + (r.clicks || 0),
      impressions: acc.impressions + (r.impressions || 0),
      ctr: 0,
      position: acc.position + (r.position || 0),
    }), { clicks: 0, impressions: 0, ctr: 0, position: 0 });

    totals.ctr = totals.impressions > 0 ? parseFloat(((totals.clicks / totals.impressions) * 100).toFixed(2)) : 0;
    totals.position = rows.length > 0 ? parseFloat((totals.position / rows.length).toFixed(1)) : 0;

    res.json({ configured: true, totals, daily: rows, startDate, endDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET URL indexing status
router.get('/inspect', auth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'url query param required' });
    const client = await getOAuth2Client();
    if (!client) return res.json({ configured: false });

    const { google } = require('googleapis');
    const inspector = google.searchconsole({ version: 'v1', auth: client.oauth2 });
    const resp = await inspector.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: client.siteUrl },
    });
    res.json({ configured: true, result: resp.data.inspectionResult });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;