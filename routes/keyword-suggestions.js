const router = require('express').Router();
const auth = require('../middleware/auth');
const KeywordSuggestion = require('../models/KeywordSuggestion');
const Keyword = require('../models/Keyword');
const SeoSettings = require('../models/SeoSettings');

// Pattern-based keyword expansion (no API needed)
function patternExpand(seed) {
  const modifiers = [
    'best', 'how to', 'what is', 'top', 'guide', 'tips', 'review', 'vs',
    'for beginners', 'near me', 'online', 'free', 'cheap', 'instant',
    'fast', 'easy', 'without', 'with', '2024', '2025', 'in india',
    'apply online', 'eligibility', 'interest rate', 'calculator', 'benefits',
    'requirements', 'process', 'documents needed', 'approval', 'same day',
  ];
  const questions = [
    `how to get ${seed}`,
    `what is ${seed}`,
    `${seed} how does it work`,
    `is ${seed} safe`,
    `${seed} pros and cons`,
    `who is eligible for ${seed}`,
    `${seed} vs personal loan`,
  ];
  const longTail = modifiers.map(m =>
    Math.random() > 0.5 ? `${m} ${seed}` : `${seed} ${m}`
  );
  return [...questions, ...longTail].map(kw => ({
    suggestedKeyword: kw,
    estimatedVolume: ['100-1K', '1K-10K', '10K-100K'][Math.floor(Math.random() * 3)],
    difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    intent: ['informational', 'transactional', 'navigational'][Math.floor(Math.random() * 3)],
    source: 'pattern',
  }));
}

// GET all suggestions
router.get('/', auth, async (req, res) => {
  try {
    const { seed, saved } = req.query;
    const q = {};
    if (seed) q.seedKeyword = new RegExp(seed, 'i');
    if (saved !== undefined) q.saved = saved === 'true';
    const suggestions = await KeywordSuggestion.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(suggestions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST generate suggestions
router.post('/generate', auth, async (req, res) => {
  try {
    const { seedKeyword } = req.body;
    if (!seedKeyword) return res.status(400).json({ message: 'seedKeyword is required' });

    const settings = await SeoSettings.findOne({ key: 'seo-settings' });
    let suggestions = [];
    let source = 'pattern';

    // Try OpenAI if key is set
    if (settings?.openaiApiKey) {
      try {
        const { default: OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: settings.openaiApiKey });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Generate 20 SEO keyword ideas related to "${seedKeyword}" for an Indian salary loan / personal finance website. Include long-tail keywords, questions, and transactional keywords. Return as JSON array: [{"suggestedKeyword":"...","estimatedVolume":"1K-10K","difficulty":"Low|Medium|High","intent":"informational|transactional|navigational"}]`,
          }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });
        const parsed = JSON.parse(resp.choices[0].message.content);
        suggestions = (parsed.keywords || parsed.suggestions || parsed.data || Object.values(parsed)[0] || []).map(s => ({ ...s, source: 'openai' }));
        source = 'openai';
      } catch (e) {
        console.error('OpenAI error, falling back to pattern:', e.message);
        suggestions = patternExpand(seedKeyword);
      }
    } else {
      suggestions = patternExpand(seedKeyword);
    }

    // Remove duplicates already in collection for this seed
    const existing = await KeywordSuggestion.find({ seedKeyword }).select('suggestedKeyword');
    const existingSet = new Set(existing.map(e => e.suggestedKeyword.toLowerCase()));
    const newOnes = suggestions.filter(s => !existingSet.has(s.suggestedKeyword.toLowerCase()));

    const docs = newOnes.map(s => ({ seedKeyword, ...s }));
    if (docs.length > 0) await KeywordSuggestion.insertMany(docs);

    const all = await KeywordSuggestion.find({ seedKeyword }).sort({ createdAt: -1 });
    res.json({ suggestions: all, source, newCount: docs.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST save suggestion to keyword tracker
router.post('/:id/save-to-tracker', auth, async (req, res) => {
  try {
    const suggestion = await KeywordSuggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ message: 'Not found' });
    const exists = await Keyword.findOne({ keyword: suggestion.suggestedKeyword });
    if (!exists) {
      await Keyword.create({ keyword: suggestion.suggestedKeyword, volume: suggestion.estimatedVolume, intent: suggestion.intent });
    }
    suggestion.saved = true;
    await suggestion.save();
    res.json({ message: 'Saved to keyword tracker', suggestion });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE suggestion
router.delete('/:id', auth, async (req, res) => {
  try {
    await KeywordSuggestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE all for a seed
router.delete('/bulk/:seedKeyword', auth, async (req, res) => {
  try {
    await KeywordSuggestion.deleteMany({ seedKeyword: req.params.seedKeyword });
    res.json({ message: 'Cleared' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;