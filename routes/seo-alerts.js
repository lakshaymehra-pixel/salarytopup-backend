const router = require('express').Router();
const auth = require('../middleware/auth');
const SeoAlert = require('../models/SeoAlert');
const Keyword = require('../models/Keyword');
const MetaTag = require('../models/MetaTag');
const SeoSettings = require('../models/SeoSettings');

// GET alerts
router.get('/', auth, async (req, res) => {
  try {
    const { resolved, severity } = req.query;
    const q = {};
    if (resolved !== undefined) q.resolved = resolved === 'true';
    if (severity) q.severity = severity;
    const alerts = await SeoAlert.find(q).sort({ createdAt: -1 }).limit(200);
    const unresolved = await SeoAlert.countDocuments({ resolved: false });
    res.json({ alerts, unresolved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT resolve
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const alert = await SeoAlert.findByIdAndUpdate(req.params.id, { resolved: true, resolvedAt: Date.now() }, { new: true });
    res.json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE alert
router.delete('/:id', auth, async (req, res) => {
  try {
    await SeoAlert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE all resolved
router.delete('/bulk/resolved', auth, async (req, res) => {
  try {
    const result = await SeoAlert.deleteMany({ resolved: true });
    res.json({ message: `Deleted ${result.deletedCount} resolved alerts` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST run-checks — scans DB and creates new alert documents
router.post('/run-checks', auth, async (req, res) => {
  try {
    const settings = await SeoSettings.findOne({ key: 'seo-settings' });
    const threshold = settings?.alertRankDropThreshold || 5;
    const newAlerts = [];

    // Check 1: Keyword rank drops
    const keywords = await Keyword.find({ currentRank: { $ne: null }, previousRank: { $ne: null } });
    for (const kw of keywords) {
      if (kw.currentRank && kw.previousRank && kw.currentRank - kw.previousRank >= threshold) {
        const exists = await SeoAlert.findOne({ type: 'rank_drop', 'data.keyword': kw.keyword, resolved: false });
        if (!exists) {
          newAlerts.push({ type: 'rank_drop', severity: 'critical', message: `"${kw.keyword}" dropped from position ${kw.previousRank} to ${kw.currentRank} (−${kw.currentRank - kw.previousRank} positions)`, data: { keyword: kw.keyword, from: kw.previousRank, to: kw.currentRank } });
        }
      }
      if (kw.currentRank && kw.previousRank && kw.previousRank - kw.currentRank >= 3) {
        const exists = await SeoAlert.findOne({ type: 'rank_rise', 'data.keyword': kw.keyword, resolved: false });
        if (!exists) {
          newAlerts.push({ type: 'rank_rise', severity: 'info', message: `"${kw.keyword}" rose from position ${kw.previousRank} to ${kw.currentRank} (+${kw.previousRank - kw.currentRank} positions)`, data: { keyword: kw.keyword, from: kw.previousRank, to: kw.currentRank } });
        }
      }
    }

    // Check 2: Missing meta tags
    if (settings?.alertMissingMeta !== false) {
      const tags = await MetaTag.find();
      for (const tag of tags) {
        if (!tag.metaTitle) {
          const exists = await SeoAlert.findOne({ type: 'no_meta_title', 'data.slug': tag.slug, resolved: false });
          if (!exists) {
            newAlerts.push({ type: 'no_meta_title', severity: 'warning', message: `Page "${tag.pageTitle || tag.slug}" has no meta title`, data: { slug: tag.slug, pageTitle: tag.pageTitle } });
          }
        }
        if (!tag.metaDescription) {
          const exists = await SeoAlert.findOne({ type: 'no_meta_desc', 'data.slug': tag.slug, resolved: false });
          if (!exists) {
            newAlerts.push({ type: 'no_meta_desc', severity: 'warning', message: `Page "${tag.pageTitle || tag.slug}" has no meta description`, data: { slug: tag.slug, pageTitle: tag.pageTitle } });
          }
        }
      }
    }

    if (newAlerts.length > 0) await SeoAlert.insertMany(newAlerts);
    const unresolved = await SeoAlert.countDocuments({ resolved: false });
    res.json({ message: `Check complete. ${newAlerts.length} new alerts created.`, newAlerts: newAlerts.length, unresolved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;