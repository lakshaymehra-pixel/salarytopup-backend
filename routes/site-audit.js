const router = require('express').Router();
const auth = require('../middleware/auth');
const SiteAudit = require('../models/SiteAudit');
const Blog = require('../models/Blog');
const Page = require('../models/Page');
const SeoSettings = require('../models/SeoSettings');

// GET latest audit
router.get('/latest', auth, async (req, res) => {
  try {
    const audit = await SiteAudit.findOne().sort({ runAt: -1 });
    res.json(audit || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET audit history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await SiteAudit.find().sort({ runAt: -1 }).select('runAt score totalPages issuesSummary').limit(20);
    res.json(history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST run new audit
router.post('/run', auth, async (req, res) => {
  try {
    const [blogs, pages] = await Promise.all([
      Blog.find().select('title slug meta_title meta_description long_description status'),
      Page.find().select('title slug metaTitle metaDescription content'),
    ]);

    const issues = [];
    const metaTitlesSeen = {};
    const metaDescsSeen = {};

    // Audit blogs
    for (const blog of blogs) {
      const url = `/blog/${blog.slug}`;
      if (!blog.meta_title) {
        issues.push({ url, slug: blog.slug, pageTitle: blog.title, type: 'missing_meta_title', severity: 'critical', detail: 'No meta title set', pageType: 'blog', pageId: blog._id });
      } else {
        if (metaTitlesSeen[blog.meta_title]) {
          issues.push({ url, slug: blog.slug, pageTitle: blog.title, type: 'duplicate_meta_title', severity: 'warning', detail: `Duplicate meta title: "${blog.meta_title}"`, pageType: 'blog', pageId: blog._id });
        }
        metaTitlesSeen[blog.meta_title] = true;
      }
      if (!blog.meta_description) {
        issues.push({ url, slug: blog.slug, pageTitle: blog.title, type: 'missing_meta_desc', severity: 'critical', detail: 'No meta description set', pageType: 'blog', pageId: blog._id });
      } else {
        if (metaDescsSeen[blog.meta_description]) {
          issues.push({ url, slug: blog.slug, pageTitle: blog.title, type: 'duplicate_meta_desc', severity: 'warning', detail: 'Duplicate meta description', pageType: 'blog', pageId: blog._id });
        }
        metaDescsSeen[blog.meta_description] = true;
      }
      // Check for images without alt text
      const content = blog.long_description || '';
      const imgTags = content.match(/<img[^>]*>/gi) || [];
      const noAlt = imgTags.filter(t => !t.includes('alt=') || t.includes('alt=""') || t.includes("alt=''"));
      if (noAlt.length > 0) {
        issues.push({ url, slug: blog.slug, pageTitle: blog.title, type: 'missing_alt_text', severity: 'warning', detail: `${noAlt.length} image(s) missing alt text`, pageType: 'blog', pageId: blog._id });
      }
    }

    // Audit CMS pages
    for (const pg of pages) {
      const url = `/${pg.slug}`;
      if (!pg.metaTitle) {
        issues.push({ url, slug: pg.slug, pageTitle: pg.title, type: 'missing_meta_title', severity: 'critical', detail: 'No meta title set', pageType: 'page', pageId: pg._id });
      }
      if (!pg.metaDescription) {
        issues.push({ url, slug: pg.slug, pageTitle: pg.title, type: 'missing_meta_desc', severity: 'critical', detail: 'No meta description set', pageType: 'page', pageId: pg._id });
      }
    }

    const totalPages = blogs.length + pages.length;
    const summary = {
      missingMetaTitle: issues.filter(i => i.type === 'missing_meta_title').length,
      missingMetaDesc: issues.filter(i => i.type === 'missing_meta_desc').length,
      missingAltText: issues.filter(i => i.type === 'missing_alt_text').length,
      duplicateMeta: issues.filter(i => i.type.startsWith('duplicate')).length,
      total: issues.length,
    };

    // Score: start at 100, deduct per issue weighted by severity
    let score = 100;
    issues.forEach(i => {
      if (i.severity === 'critical') score -= 3;
      else if (i.severity === 'warning') score -= 1;
    });
    score = Math.max(0, Math.min(100, Math.round(score)));

    const audit = await SiteAudit.create({ score, totalPages, issuesSummary: summary, issues });
    res.json(audit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET sitemap XML
router.get('/sitemap', async (req, res) => {
  try {
    const settings = await SeoSettings.findOne({ key: 'seo-settings' });
    const base = settings?.siteUrl || 'https://salarytopup.com';
    const [blogs, pages] = await Promise.all([
      Blog.find({ status: 'published' }).select('slug updatedAt'),
      Page.find().select('slug updatedAt'),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    if (settings?.sitemapIncludeBlogs !== false) {
      for (const b of blogs) {
        xml += `  <url><loc>${base}/blog/${b.slug}</loc><lastmod>${new Date(b.updatedAt).toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      }
    }
    if (settings?.sitemapIncludePages !== false) {
      for (const p of pages) {
        xml += `  <url><loc>${base}/${p.slug}</loc><lastmod>${new Date(p.updatedAt).toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
      }
    }
    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST generate & save sitemap timestamp
router.post('/sitemap/generate', auth, async (req, res) => {
  try {
    await SeoSettings.findOneAndUpdate({ key: 'seo-settings' }, { sitemapLastGenerated: new Date() }, { upsert: true });
    const [blogs, pages] = await Promise.all([Blog.countDocuments({ status: 'published' }), Page.countDocuments()]);
    res.json({ message: 'Sitemap generated', urls: blogs + pages + 1, generatedAt: new Date() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;