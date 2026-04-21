const router = require('express').Router();
const auth = require('../middleware/auth');
const Keyword = require('../models/Keyword');
const MetaTag = require('../models/MetaTag');
const SeoAlert = require('../models/SeoAlert');
const SiteAudit = require('../models/SiteAudit');
const Blog = require('../models/Blog');
const SeoSettings = require('../models/SeoSettings');

router.get('/', auth, async (req, res) => {
  try {
    const [
      totalKeywords,
      top10Keywords,
      missingMetaCount,
      unresolvedAlerts,
      latestAudit,
      recentAlerts,
      settings,
    ] = await Promise.all([
      Keyword.countDocuments(),
      Keyword.countDocuments({ currentRank: { $gte: 1, $lte: 10 } }),
      MetaTag.countDocuments({ $or: [{ metaTitle: '' }, { metaDescription: '' }] }),
      SeoAlert.countDocuments({ resolved: false }),
      SiteAudit.findOne().sort({ runAt: -1 }).select('score runAt issuesSummary totalPages'),
      SeoAlert.find({ resolved: false }).sort({ createdAt: -1 }).limit(5),
      SeoSettings.findOne({ key: 'seo-settings' }),
    ]);

    // Top performing keywords
    const topKeywords = await Keyword.find({ currentRank: { $ne: null } }).sort({ currentRank: 1 }).limit(10).select('keyword currentRank previousRank gscClicks gscImpressions url');

    // Keywords improving (rank going down = better)
    const improving = await Keyword.find({
      currentRank: { $ne: null },
      previousRank: { $ne: null },
      $expr: { $lt: ['$currentRank', '$previousRank'] },
    }).sort({ currentRank: 1 }).limit(5).select('keyword currentRank previousRank');

    // Keywords declining
    const declining = await Keyword.find({
      currentRank: { $ne: null },
      previousRank: { $ne: null },
      $expr: { $gt: ['$currentRank', '$previousRank'] },
    }).sort({ currentRank: 1 }).limit(5).select('keyword currentRank previousRank');

    res.json({
      stats: {
        totalKeywords,
        top10Keywords,
        missingMetaCount,
        unresolvedAlerts,
        auditScore: latestAudit?.score ?? null,
        auditRunAt: latestAudit?.runAt ?? null,
      },
      topKeywords,
      improving,
      declining,
      recentAlerts,
      gscConnected: !!(settings?.gscRefreshToken),
      gaConnected: !!(settings?.gaPrivateKey && settings?.gaPropertyId),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;