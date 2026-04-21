const router = require('express').Router();
const auth = require('../middleware/auth');
const SeoSettings = require('../models/SeoSettings');

async function getGAClient() {
  const s = await SeoSettings.findOne({ key: 'seo-settings' });
  if (!s || !s.gaPrivateKey || !s.gaPropertyId) return null;
  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: s.gaClientEmail, private_key: s.gaPrivateKey.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  return { auth, propertyId: s.gaPropertyId };
}

// GET traffic overview
router.get('/traffic', auth, async (req, res) => {
  try {
    const client = await getGAClient();
    if (!client) return res.json({ configured: false, message: 'Google Analytics not configured. Go to SEO Settings → Google Analytics.' });

    const { days = 28 } = req.query;
    const { google } = require('googleapis');
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: client.auth });

    const endDate = 'today';
    const startDate = `${days}daysAgo`;

    const resp = await analyticsdata.properties.runReport({
      property: `properties/${client.propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'bounceRate' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      },
    });

    const rows = (resp.data.rows || []).map(r => ({
      date: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value),
      users: parseInt(r.metricValues[1].value),
      pageviews: parseInt(r.metricValues[2].value),
      bounceRate: parseFloat(r.metricValues[3].value).toFixed(2),
    }));

    const totals = rows.reduce((acc, r) => ({
      sessions: acc.sessions + r.sessions,
      users: acc.users + r.users,
      pageviews: acc.pageviews + r.pageviews,
    }), { sessions: 0, users: 0, pageviews: 0 });

    res.json({ configured: true, rows, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET top pages
router.get('/top-pages', auth, async (req, res) => {
  try {
    const client = await getGAClient();
    if (!client) return res.json({ configured: false });

    const { days = 28 } = req.query;
    const { google } = require('googleapis');
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: client.auth });

    const resp = await analyticsdata.properties.runReport({
      property: `properties/${client.propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20,
      },
    });

    const rows = (resp.data.rows || []).map(r => ({
      path: r.dimensionValues[0].value,
      title: r.dimensionValues[1].value,
      sessions: parseInt(r.metricValues[0].value),
      pageviews: parseInt(r.metricValues[1].value),
      avgDuration: parseFloat(r.metricValues[2].value).toFixed(0),
    }));

    res.json({ configured: true, rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET top countries
router.get('/countries', auth, async (req, res) => {
  try {
    const client = await getGAClient();
    if (!client) return res.json({ configured: false });

    const { days = 28 } = req.query;
    const { google } = require('googleapis');
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: client.auth });

    const resp = await analyticsdata.properties.runReport({
      property: `properties/${client.propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      },
    });

    const rows = (resp.data.rows || []).map(r => ({ country: r.dimensionValues[0].value, sessions: parseInt(r.metricValues[0].value) }));
    res.json({ configured: true, rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;