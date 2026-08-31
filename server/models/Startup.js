const mongoose = require('mongoose');

const FounderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Founder name is required'],
    trim: true,
  },
  background: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const EvaluationSchema = new mongoose.Schema({
  experience: {
    type: Number,
    min: 1,
    max: 10,
  },
  domainExpertise: {
    type: Number,
    min: 1,
    max: 10,
  },
  execution: {
    type: Number,
    min: 1,
    max: 10,
  },
  vision: {
    type: Number,
    min: 1,
    max: 10,
  },
  teamStrength: {
    type: Number,
    min: 1,
    max: 10,
  },
  overallScore: {
    type: Number,
    min: 1,
    max: 10,
  },
  updatedAt: {
    type: Date,
  },
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  marketOpportunity: { type: String, default: '' },
  marketScore: { type: Number, min: 1, max: 10 },
  businessModel: { type: String, default: '' },
  businessModelScore: { type: Number, min: 1, max: 10 },
  competitiveLandscape: { type: String, default: '' },
  competitionScore: { type: Number, min: 1, max: 10 },
  revenue: { type: String, default: '' },
  growthPotential: { type: String, default: '' },
  growthScore: { type: Number, min: 1, max: 10 },
  keyRisks: { type: String, default: '' },
  riskScore: { type: Number, min: 1, max: 10 },
  investmentThesis: { type: String, default: '' },
  updatedAt: { type: Date },
}, { _id: false });

const ScorecardSchema = new mongoose.Schema({
  founderScore: { type: Number },
  marketScore: { type: Number },
  businessModelScore: { type: Number },
  growthScore: { type: Number },
  competitionScore: { type: Number },
  riskScore: { type: Number },
  overallInvestmentScore: { type: Number },
  systemRecommendation: {
    type: String,
    enum: ['INVEST', 'WATCHLIST', 'REJECT', 'PENDING'],
    default: 'PENDING',
  },
  strengths: [{ type: String }],
  concerns: [{ type: String }],
  confidence: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW', 'PENDING'],
    default: 'PENDING',
  },
}, { _id: false });

const DecisionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['UNDER_EVALUATION', 'INVEST', 'WATCHLIST', 'REJECT'],
    default: 'UNDER_EVALUATION',
  },
  comment: {
    type: String,
    default: '',
  },
  decidedBy: {
    type: String,
    default: 'Investment Analyst',
  },
  decidedAt: {
    type: Date,
  },
}, { _id: false });

const StartupSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true,
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    index: true,
  },
  stage: {
    type: String,
    required: [true, 'Stage is required'],
    enum: {
      values: ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'],
      message: '{VALUE} is not a supported stage',
    },
    default: 'Seed',
    index: true,
  },
  founder: {
    type: FounderSchema,
    required: [true, 'Founder details are required'],
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },
  location: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  evaluation: {
    type: EvaluationSchema,
    default: () => ({}),
  },
  analysis: {
    type: AnalysisSchema,
    default: () => ({}),
  },
  scorecard: {
    type: ScorecardSchema,
    default: () => ({
      systemRecommendation: 'PENDING',
      confidence: 'PENDING',
      strengths: [],
      concerns: [],
    }),
  },
  decision: {
    type: DecisionSchema,
    default: () => ({
      status: 'UNDER_EVALUATION',
      comment: '',
      decidedBy: 'Investment Analyst',
    }),
  },
  pipelineStage: {
    type: String,
    enum: ['DISCOVERED', 'UNDER_REVIEW', 'EVALUATION', 'COMMITTEE', 'CLOSED'],
    default: 'DISCOVERED',
  },
}, {
  timestamps: true,
});

// Text index for full-text search capability
StartupSchema.index({
  companyName: 'text',
  'founder.name': 'text',
  description: 'text',
  industry: 'text',
});

module.exports = mongoose.model('Startup', StartupSchema);
