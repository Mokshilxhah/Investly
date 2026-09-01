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
    min: 0,
    max: 10,
  },
  domainExpertise: {
    type: Number,
    min: 0,
    max: 10,
  },
  execution: {
    type: Number,
    min: 0,
    max: 10,
  },
  vision: {
    type: Number,
    min: 0,
    max: 10,
  },
  teamStrength: {
    type: Number,
    min: 0,
    max: 10,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
  },
  updatedAt: {
    type: Date,
  },
}, { _id: false });

const RiskCategoriesSchema = new mongoose.Schema({
  founderRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  marketRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  executionRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  financialRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  competitiveRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  marketOpportunity: { type: String, default: '' },
  marketScore: { type: Number, min: 0, max: 10 },
  businessModel: { type: String, default: '' },
  businessModelScore: { type: Number, min: 0, max: 10 },
  competitiveLandscape: { type: String, default: '' },
  competitionScore: { type: Number, min: 0, max: 10 },
  revenue: { type: String, default: '' },
  growthPotential: { type: String, default: '' },
  growthScore: { type: Number, min: 0, max: 10 },
  keyRisks: { type: String, default: '' },
  riskScore: { type: Number, min: 0, max: 10 },
  riskCategories: {
    type: RiskCategoriesSchema,
    default: () => ({
      founderRisk: 'LOW',
      marketRisk: 'LOW',
      executionRisk: 'LOW',
      financialRisk: 'LOW',
      competitiveRisk: 'LOW',
    }),
  },
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
  riskVetoTriggered: { type: Boolean, default: false },
  riskVetoReason: { type: String, default: '' },
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
  overrideOccurred: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const StageHistorySchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
  enteredAt: {
    type: Date,
    default: Date.now,
  },
  exitedAt: {
    type: Date,
    default: null,
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
      riskVetoTriggered: false,
      riskVetoReason: '',
    }),
  },
  decision: {
    type: DecisionSchema,
    default: () => ({
      status: 'UNDER_EVALUATION',
      comment: '',
      decidedBy: 'Investment Analyst',
      overrideOccurred: false,
    }),
  },
  pipelineStage: {
    type: String,
    enum: [
      'Discovered', 'Screening', 'Deep Dive', 'Committee', 'Closed',
      'DISCOVERED', 'UNDER_REVIEW', 'SCREENING', 'DEEP_DIVE', 'EVALUATION', 'COMMITTEE', 'CLOSED',
      'discovered', 'screening', 'deep dive', 'committee', 'closed'
    ],
    default: 'Discovered',
    set: function(val) {
      if (!val) return 'Discovered';
      const clean = val.toString().trim().toUpperCase();
      if (clean === 'DISCOVERED') return 'Discovered';
      if (clean === 'UNDER_REVIEW' || clean === 'SCREENING') return 'Screening';
      if (clean === 'EVALUATION' || clean === 'DEEP DIVE' || clean === 'DEEP_DIVE') return 'Deep Dive';
      if (clean === 'COMMITTEE') return 'Committee';
      if (clean === 'CLOSED') return 'Closed';
      return val;
    },
    index: true,
  },
  stageHistory: {
    type: [StageHistorySchema],
    default: () => ([{ stage: 'Discovered', enteredAt: new Date(), exitedAt: null }]),
  },
}, {
  timestamps: true,
});

StartupSchema.pre('save', function(next) {
  if (this.pipelineStage) {
    const clean = this.pipelineStage.toString().trim().toUpperCase();
    if (clean === 'DISCOVERED') this.pipelineStage = 'Discovered';
    else if (clean === 'UNDER_REVIEW' || clean === 'SCREENING') this.pipelineStage = 'Screening';
    else if (clean === 'EVALUATION' || clean === 'DEEP DIVE' || clean === 'DEEP_DIVE') this.pipelineStage = 'Deep Dive';
    else if (clean === 'COMMITTEE') this.pipelineStage = 'Committee';
    else if (clean === 'CLOSED') this.pipelineStage = 'Closed';
  }
  next();
});

// Text index for full-text search capability
StartupSchema.index({
  companyName: 'text',
  'founder.name': 'text',
  description: 'text',
  industry: 'text',
});

module.exports = mongoose.model('Startup', StartupSchema);
