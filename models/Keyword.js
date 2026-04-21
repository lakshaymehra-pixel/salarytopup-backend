const mongoose = require('mongoose');

const RankHistorySchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const KeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  currentRank: { type: Number, default: null },
  previousRank: { type: Number, default: null },
  targetRank: { type: Number, default: 1 },
  url: { type: String, default: '' },
  notes: { type: String, default: '' },
  history: [RankHistorySchema],
  // GSC synced fields
  gscImpressions: { type: Number, default: 0 },
  gscClicks: { type: Number, default: 0 },
  gscCtr: { type: Number, default: 0 },
  gscPosition: { type: Number, default: null },
  gscLastSync: { type: Date, default: null },
  // Manual enrichment
  volume: { type: String, default: '' },
  difficulty: { type: Number, default: null },
  intent: { type: String, enum: ['informational', 'navigational', 'transactional', 'commercial', ''], default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Keyword', KeywordSchema);