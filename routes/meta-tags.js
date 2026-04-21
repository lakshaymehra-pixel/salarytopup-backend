const router = require('express').Router();
const auth = require('../middleware/auth');
const MetaTag = require('../models/MetaTag');
const Blog = require('../models/Blog');
const Page = require('../models/Page');

// GET all meta tags with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    const q = {};
    if (type) q.pageType = type;
    if (search) q.$or = [{ pageTitle: new RegExp(search, 'i') }, { slug: new RegExp(search, 'i') }];
    const total = await MetaTag.countDocuments(q);
    const tags = await MetaTag.find(q).sort({ pageType: 1, pageTitle: 1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ tags, total, page: Number(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single by slug
router.get('/:slug', auth, async (req, res) => {
  try {
    const tag = await MetaTag.findOne({ slug: req.params.slug });
    if (!tag) return res.status(404).json({ message: 'Not found' });
    res.json(tag);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT upsert by slug
router.put('/:slug', auth, async (req, res) => {
  try {
    const { metaTitle, metaDescription, ogTitle, ogDescription, ogImage, canonicalUrl, robotsDirective } = req.body;
    const tag = await MetaTag.findOneAndUpdate(
      { slug: req.params.slug },
      { metaTitle, metaDescription, ogTitle, ogDescription, ogImage, canonicalUrl, robotsDirective, updatedAt: Date.now() },
      { new: true, upsert: false }
    );
    if (!tag) return res.status(404).json({ message: 'MetaTag not found' });

    // Also sync back to source model
    if (tag.pageType === 'page' && tag.pageId) {
      await Page.findByIdAndUpdate(tag.pageId, { metaTitle, metaDescription, ogTitle, ogDescription, ogImage, canonicalUrl, robotsDirective });
    } else if (tag.pageType === 'blog' && tag.pageId) {
      await Blog.findByIdAndUpdate(tag.pageId, { meta_title: metaTitle, meta_description: metaDescription });
    }
    res.json(tag);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST sync — create MetaTag stubs for all blogs and pages that don't have one
router.post('/sync', auth, async (req, res) => {
  try {
    const [blogs, pages] = await Promise.all([Blog.find(), Page.find()]);
    let created = 0;

    for (const blog of blogs) {
      const slug = `blog-${blog.slug || blog._id}`;
      const exists = await MetaTag.findOne({ slug });
      if (!exists) {
        await MetaTag.create({
          pageType: 'blog',
          pageId: blog._id,
          slug,
          pageTitle: blog.title || '',
          metaTitle: blog.meta_title || '',
          metaDescription: blog.meta_description || '',
          canonicalUrl: blog.canonical_url || '',
        });
        created++;
      }
    }

    for (const pg of pages) {
      const slug = `page-${pg.slug}`;
      const exists = await MetaTag.findOne({ slug });
      if (!exists) {
        await MetaTag.create({
          pageType: 'page',
          pageId: pg._id,
          slug,
          pageTitle: pg.title || '',
          metaTitle: pg.metaTitle || '',
          metaDescription: pg.metaDescription || '',
          canonicalUrl: pg.canonicalUrl || '',
        });
        created++;
      }
    }

    res.json({ message: `Sync complete. Created ${created} new meta tag entries.`, created });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;