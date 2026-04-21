const router = require('express').Router();
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const [totalBlogs, publishedBlogs, totalContacts, newContacts, totalApplications, pendingApplications, approvedApplications] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' }),
    ]);

    const recentApplications = await Application.find().sort({ createdAt: -1 }).limit(5);
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);

    // Monthly blog posts - last 6 months
    // Get first blog date to know range
    const firstBlog = await Blog.findOne().sort({ createdAt: 1 });
    const startDate = firstBlog ? new Date(firstBlog.createdAt) : new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyBlogs = await Blog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const blogChartData = [];
    const now = new Date();
    const start = new Date(startDate);
    while (start <= now) {
      const y = start.getFullYear(), m = start.getMonth() + 1;
      const found = monthlyBlogs.find(x => x._id.year === y && x._id.month === m);
      blogChartData.push({ month: `${months[m-1]} ${y !== now.getFullYear() ? String(y).slice(2) : ''}`.trim(), posts: found ? found.count : 0 });
      start.setMonth(start.getMonth() + 1);
    }

    res.json({
      blogs: { total: totalBlogs, published: publishedBlogs, draft: totalBlogs - publishedBlogs },
      contacts: { total: totalContacts, new: newContacts },
      applications: { total: totalApplications, pending: pendingApplications, approved: approvedApplications },
      recentApplications,
      recentContacts,
      blogChartData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;