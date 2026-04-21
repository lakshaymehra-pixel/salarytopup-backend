const mongoose = require('mongoose');

const KeywordSuggestionSchema = new mongoose.Schema({
  seedKeyword: { type: String, required: true },
  suggestedKeyword: { type: String, required: true },
  estimatedVolume: { type: String, default: 'Unknown' },
  difficulty: { type: String, default: 'Medium' },
  intent: { type: String, default: 'informational' },
  source: { type: String, enum: ['openai', 'pattern', 'manual'], default: 'pattern' },
  saved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KeywordSuggestion', KeywordSuggestionSchema);