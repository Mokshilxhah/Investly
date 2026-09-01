const Startup = require('../models/Startup');
const {
  calculateFounderScore,
  calculateOverallInvestmentScore,
  getSystemRecommendation,
  generateDecisionExplanation,
} = require('../utils/scoring');
const {
  canAdvance,
  applyRiskVeto,
  PIPELINE_STAGES,
} = require('../utils/pipelineGate');

/**
 * Helper to recalculate scorecard and decision engine recommendation for a startup.
 */
const recalculateScorecard = (startup) => {
  const founderScore = startup.evaluation?.overallScore;
  const analysis = startup.analysis || {};

  const marketScore = analysis.marketScore;
  const businessModelScore = analysis.businessModelScore;
  const growthScore = analysis.growthScore;
  const competitionScore = analysis.competitionScore;
  const riskScore = analysis.riskScore;
  const riskCategories = analysis.riskCategories || {};

  if (
    founderScore !== undefined &&
    founderScore !== null &&
    marketScore !== undefined &&
    marketScore !== null &&
    businessModelScore !== undefined &&
    businessModelScore !== null &&
    growthScore !== undefined &&
    growthScore !== null &&
    competitionScore !== undefined &&
    competitionScore !== null &&
    riskScore !== undefined &&
    riskScore !== null
  ) {
    const scores = {
      founderScore,
      marketScore,
      businessModelScore,
      growthScore,
      competitionScore,
      riskScore,
    };

    const overallInvestmentScore = calculateOverallInvestmentScore(scores);
    let systemRecommendation = getSystemRecommendation(overallInvestmentScore);
    const { strengths, concerns, confidence } = generateDecisionExplanation({
      ...scores,
      overallInvestmentScore,
    });

    // Check risk veto engine
    const veto = applyRiskVeto(overallInvestmentScore, riskCategories);
    let riskVetoTriggered = false;
    let riskVetoReason = '';

    if (veto.vetoTriggered) {
      riskVetoTriggered = true;
      riskVetoReason = veto.reason;
      if (veto.recommendation) {
        systemRecommendation = veto.recommendation;
      }
    }

    startup.scorecard = {
      founderScore,
      marketScore,
      businessModelScore,
      growthScore,
      competitionScore,
      riskScore,
      overallInvestmentScore,
      systemRecommendation,
      strengths,
      concerns,
      confidence,
      riskVetoTriggered,
      riskVetoReason,
    };
  }
};

/**
 * @desc    Get all startups with filtering, searching, and sorting
 * @route   GET /api/startups
 */
const getStartups = async (req, res, next) => {
  try {
    const {
      search,
      industry,
      stage,
      decision,
      pipelineStage,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Text Search
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: regex },
        { 'founder.name': regex },
        { 'founder.background': regex },
        { industry: regex },
        { description: regex },
        { location: regex },
      ];
    }

    // Exact match filters
    if (industry && industry !== 'ALL') {
      query.industry = new RegExp(`^${industry.trim()}$`, 'i');
    }

    if (stage && stage !== 'ALL') {
      query.stage = stage.trim();
    }

    if (pipelineStage && pipelineStage !== 'ALL') {
      query.pipelineStage = pipelineStage.trim();
    }

    if (decision && decision !== 'ALL') {
      query['decision.status'] = decision.trim();
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'score') {
      sortOptions = { 'scorecard.overallInvestmentScore': sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'founderScore') {
      sortOptions = { 'evaluation.overallScore': sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'companyName') {
      sortOptions = { companyName: sortOrder === 'asc' ? 1 : -1 };
    } else {
      sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    }

    const startups = await Startup.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: startups.length,
      data: startups,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single startup by ID
 * @route   GET /api/startups/:id
 */
const getStartupById = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    // Calculate gate check info dynamically
    const gateInfo = canAdvance(startup);

    res.status(200).json({
      success: true,
      data: {
        ...startup.toObject(),
        gateInfo,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new startup
 * @route   POST /api/startups
 */
const createStartup = async (req, res, next) => {
  try {
    const { companyName, industry, stage, founder, website, location, description } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    const cleanName = companyName.trim();

    // Prevent duplicate entries (case-insensitive)
    const existing = await Startup.findOne({
      companyName: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A startup named "${cleanName}" already exists. Duplicate entries are not allowed.`,
      });
    }

    // Normalize website URL if provided
    let cleanWebsite = (website || '').trim();
    if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
      cleanWebsite = `https://${cleanWebsite}`;
    }

    const startup = new Startup({
      companyName: cleanName,
      industry: industry || 'Fintech',
      stage: stage || 'Seed',
      founder: {
        name: founder?.name?.trim() || 'Founding Team',
        background: founder?.background?.trim() || '',
      },
      website: cleanWebsite,
      location: location?.trim() || '',
      description: description?.trim() || '',
      pipelineStage: 'Discovered',
      stageHistory: [{ stage: 'Discovered', enteredAt: new Date(), exitedAt: null }],
    });

    const savedStartup = await startup.save();

    res.status(201).json({
      success: true,
      message: 'Startup registered successfully',
      data: savedStartup,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update startup profile
 * @route   PUT /api/startups/:id
 */
const updateStartup = async (req, res, next) => {
  try {
    const { companyName, industry, stage, founder, website, location, description } = req.body;

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    if (companyName) startup.companyName = companyName;
    if (industry) startup.industry = industry;
    if (stage) startup.stage = stage;
    if (founder?.name) startup.founder.name = founder.name;
    if (founder?.background !== undefined) startup.founder.background = founder.background;
    if (website !== undefined) startup.website = website;
    if (location !== undefined) startup.location = location;
    if (description !== undefined) startup.description = description;

    const updatedStartup = await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup profile updated successfully',
      data: updatedStartup,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete startup
 * @route   DELETE /api/startups/:id
 */
const deleteStartup = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    await startup.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Startup deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update founder evaluation & auto-calculate overall founder score
 * @route   PUT /api/startups/:id/evaluation
 */
const updateEvaluation = async (req, res, next) => {
  try {
    const { experience, domainExpertise, execution, vision, teamStrength, overallScore: clientOverallScore, meetingNotes, notes } = req.body;

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    let calculatedScore = calculateFounderScore({
      experience,
      domainExpertise,
      execution,
      vision,
      teamStrength,
    });

    let finalOverallScore = (clientOverallScore !== undefined && clientOverallScore !== null && !isNaN(Number(clientOverallScore)))
      ? Math.max(0, Math.min(10, Math.round(Number(clientOverallScore) * 10) / 10))
      : (calculatedScore !== null ? calculatedScore : 0);

    startup.evaluation = {
      experience: experience !== undefined && !isNaN(Number(experience)) ? Math.max(0, Math.min(10, Number(experience))) : finalOverallScore,
      domainExpertise: domainExpertise !== undefined && !isNaN(Number(domainExpertise)) ? Math.max(0, Math.min(10, Number(domainExpertise))) : finalOverallScore,
      execution: execution !== undefined && !isNaN(Number(execution)) ? Math.max(0, Math.min(10, Number(execution))) : finalOverallScore,
      vision: vision !== undefined && !isNaN(Number(vision)) ? Math.max(0, Math.min(10, Number(vision))) : finalOverallScore,
      teamStrength: teamStrength !== undefined && !isNaN(Number(teamStrength)) ? Math.max(0, Math.min(10, Number(teamStrength))) : finalOverallScore,
      overallScore: finalOverallScore,
      updatedAt: new Date(),
    };

    if (!startup.founder) startup.founder = { name: 'Founder', background: '' };
    if (!startup.founder.name) startup.founder.name = 'Founder';
    if (meetingNotes !== undefined || notes !== undefined) {
      startup.founder.background = (meetingNotes !== undefined ? meetingNotes : notes || '').trim();
    }

    recalculateScorecard(startup);

    const updated = await startup.save();
    const gateInfo = canAdvance(updated);

    res.status(200).json({
      success: true,
      message: 'Founder evaluation recorded and overall score computed successfully',
      data: {
        ...updated.toObject(),
        gateInfo,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update investment analysis & compute scorecard
 * @route   PUT /api/startups/:id/analysis
 */
const updateAnalysis = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    const {
      marketOpportunity,
      marketScore,
      businessModel,
      businessModelScore,
      competitiveLandscape,
      competitionScore,
      revenue,
      growthPotential,
      growthScore,
      keyRisks,
      riskScore,
      riskCategories,
      investmentThesis,
    } = req.body;

    const validRiskCategories = {
      founderRisk: ['LOW', 'MEDIUM', 'HIGH'].includes(riskCategories?.founderRisk) ? riskCategories.founderRisk : 'LOW',
      marketRisk: ['LOW', 'MEDIUM', 'HIGH'].includes(riskCategories?.marketRisk) ? riskCategories.marketRisk : 'LOW',
      executionRisk: ['LOW', 'MEDIUM', 'HIGH'].includes(riskCategories?.executionRisk) ? riskCategories.executionRisk : 'LOW',
      financialRisk: ['LOW', 'MEDIUM', 'HIGH'].includes(riskCategories?.financialRisk) ? riskCategories.financialRisk : 'LOW',
      competitiveRisk: ['LOW', 'MEDIUM', 'HIGH'].includes(riskCategories?.competitiveRisk) ? riskCategories.competitiveRisk : 'LOW',
    };

    startup.analysis = {
      marketOpportunity: marketOpportunity || '',
      marketScore: marketScore !== undefined && !isNaN(Number(marketScore)) ? Math.max(0, Math.min(10, Number(marketScore))) : 0,
      businessModel: businessModel || '',
      businessModelScore: businessModelScore !== undefined && !isNaN(Number(businessModelScore)) ? Math.max(0, Math.min(10, Number(businessModelScore))) : 0,
      competitiveLandscape: competitiveLandscape || '',
      competitionScore: competitionScore !== undefined && !isNaN(Number(competitionScore)) ? Math.max(0, Math.min(10, Number(competitionScore))) : 0,
      revenue: revenue || '',
      growthPotential: growthPotential || '',
      growthScore: growthScore !== undefined && !isNaN(Number(growthScore)) ? Math.max(0, Math.min(10, Number(growthScore))) : 0,
      keyRisks: keyRisks || '',
      riskScore: riskScore !== undefined && !isNaN(Number(riskScore)) ? Math.max(0, Math.min(10, Number(riskScore))) : 0,
      riskCategories: validRiskCategories,
      investmentThesis: investmentThesis || '',
      updatedAt: new Date(),
    };

    if (!startup.founder) startup.founder = { name: 'Founder', background: '' };
    if (!startup.founder.name) startup.founder.name = 'Founder';

    recalculateScorecard(startup);

    const updated = await startup.save();
    const gateInfo = canAdvance(updated);

    res.status(200).json({
      success: true,
      message: 'Investment analysis updated successfully',
      data: {
        ...updated.toObject(),
        gateInfo,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Record investment decision
 * @route   PUT /api/startups/:id/decision
 */
const updateDecision = async (req, res, next) => {
  try {
    const { status, comment, decidedBy } = req.body;

    const validStatuses = ['UNDER_EVALUATION', 'INVEST', 'WATCHLIST', 'REJECT'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Decision status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    const systemRec = startup.scorecard?.systemRecommendation || 'PENDING';
    const overrideOccurred =
      systemRec !== 'PENDING' && status !== 'UNDER_EVALUATION' && status !== systemRec;

    startup.decision = {
      status,
      comment: comment || '',
      decidedBy: decidedBy || 'Investment Analyst',
      decidedAt: new Date(),
      overrideOccurred,
    };

    // If final decision is made and startup is in Committee, advance to Closed
    if (status !== 'UNDER_EVALUATION' && startup.pipelineStage === 'Committee') {
      const now = new Date();
      if (startup.stageHistory && startup.stageHistory.length > 0) {
        startup.stageHistory[startup.stageHistory.length - 1].exitedAt = now;
      }
      startup.pipelineStage = 'Closed';
      startup.stageHistory.push({
        stage: 'Closed',
        enteredAt: now,
        exitedAt: null,
      });
    }

    const updated = await startup.save();
    const gateInfo = canAdvance(updated);

    res.status(200).json({
      success: true,
      message: `Decision updated to ${status}`,
      data: {
        ...updated.toObject(),
        gateInfo,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Advance startup to next pipeline stage
 * @route   POST /api/startups/:id/advance-stage
 */
const advanceStage = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    const gate = canAdvance(startup);
    if (!gate.allowed) {
      return res.status(400).json({
        success: false,
        message: gate.reason,
        weakestDimension: gate.weakestDimension,
      });
    }

    const newStage = gate.nextStage;
    const now = new Date();

    // Close out previous stage history
    if (startup.stageHistory && startup.stageHistory.length > 0) {
      startup.stageHistory[startup.stageHistory.length - 1].exitedAt = now;
    }

    startup.pipelineStage = newStage;
    startup.stageHistory.push({
      stage: newStage,
      enteredAt: now,
      exitedAt: null,
    });

    const updated = await startup.save();
    const newGateInfo = canAdvance(updated);

    res.status(200).json({
      success: true,
      message: `Successfully advanced to ${newStage}`,
      data: {
        ...updated.toObject(),
        gateInfo: newGateInfo,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get full pipeline Kanban board grouping
 * @route   GET /api/pipeline
 */
const getPipeline = async (req, res, next) => {
  try {
    const startups = await Startup.find({}).sort({ updatedAt: -1 });

    const pipeline = {
      Discovered: [],
      Screening: [],
      'Deep Dive': [],
      Committee: [],
      Closed: [],
    };

    startups.forEach((s) => {
      const stage = s.pipelineStage || 'Discovered';
      if (pipeline[stage]) {
        pipeline[stage].push(s);
      } else {
        pipeline.Discovered.push(s);
      }
    });

    res.status(200).json({
      success: true,
      data: pipeline,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get pipeline bottleneck statistics & average dwell time
 * @route   GET /api/pipeline/bottleneck
 */
const getBottleneckStats = async (req, res, next) => {
  try {
    const stageCounts = await Startup.aggregate([
      { $match: { pipelineStage: { $ne: 'Closed' } } },
      { $group: { _id: '$pipelineStage', count: { $sum: 1 } } },
    ]);

    // Average time spent in each stage
    const avgDwellTime = await Startup.aggregate([
      { $unwind: '$stageHistory' },
      { $match: { 'stageHistory.exitedAt': { $ne: null } } },
      {
        $project: {
          stage: '$stageHistory.stage',
          durationDays: {
            $divide: [
              { $subtract: ['$stageHistory.exitedAt', '$stageHistory.enteredAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      { $group: { _id: '$stage', avgDays: { $avg: '$durationDays' } } },
    ]);

    // Find bottleneck stage (most active startups)
    let bottleneckStage = null;
    let maxCount = -1;

    stageCounts.forEach((sc) => {
      if (sc.count > maxCount) {
        maxCount = sc.count;
        bottleneckStage = sc._id;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stageCounts,
        avgDwellTime,
        bottleneckStage,
        activeStartupsInBottleneck: maxCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk create startups from Excel/CSV import
 * @route   POST /api/startups/bulk
 */
const bulkCreateStartups = async (req, res, next) => {
  try {
    const { startups: items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No startup items provided for bulk upload',
      });
    }

    const createdList = [];
    const errors = [];

    // Fetch existing startup names from DB to prevent duplicate records
    const existingStartups = await Startup.find({}, 'companyName').lean();
    const existingNames = new Set(
      existingStartups.map((s) => s.companyName.trim().toLowerCase())
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        if (!item.companyName || !item.companyName.trim()) {
          errors.push({ row: i + 1, message: 'Company name is required' });
          continue;
        }

        const nameKey = item.companyName.trim().toLowerCase();
        if (existingNames.has(nameKey)) {
          errors.push({
            row: i + 1,
            companyName: item.companyName.trim(),
            message: `Startup "${item.companyName.trim()}" already exists. Skipped duplicate.`,
          });
          continue;
        }
        existingNames.add(nameKey);

        let cleanWebsite = (item.website || '').trim();
        if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
          cleanWebsite = `https://${cleanWebsite}`;
        }

        const newStartup = new Startup({
          companyName: item.companyName.trim(),
          industry: item.industry || 'Technology',
          stage: item.stage || 'Seed',
          founder: {
            name: item.founder?.name || item.founderName || 'Founding Team',
            background: item.founder?.background || item.founderBackground || '',
          },
          website: cleanWebsite,
          location: item.location || '',
          description: item.description || '',
          pipelineStage: 'Discovered',
          stageHistory: [{ stage: 'Discovered', enteredAt: new Date(), exitedAt: null }],
        });

        const saved = await newStartup.save();
        createdList.push(saved);
      } catch (err) {
        errors.push({ row: i + 1, message: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdList.length} startups from spreadsheet`,
      count: createdList.length,
      errors: errors.length > 0 ? errors : undefined,
      data: createdList,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStartups,
  getStartupById,
  createStartup,
  updateStartup,
  deleteStartup,
  updateEvaluation,
  updateAnalysis,
  updateDecision,
  advanceStage,
  getPipeline,
  getBottleneckStats,
  bulkCreateStartups,
};
