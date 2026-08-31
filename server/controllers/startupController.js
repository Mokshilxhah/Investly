const Startup = require('../models/Startup');
const {
  calculateFounderScore,
  calculateOverallInvestmentScore,
  getSystemRecommendation,
  generateDecisionExplanation,
} = require('../utils/scoring');

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

  if (
    founderScore !== undefined &&
    marketScore !== undefined &&
    businessModelScore !== undefined &&
    growthScore !== undefined &&
    competitionScore !== undefined &&
    riskScore !== undefined
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
    const systemRecommendation = getSystemRecommendation(overallInvestmentScore);
    const { strengths, concerns, confidence } = generateDecisionExplanation({
      ...scores,
      overallInvestmentScore,
    });

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

    res.status(200).json({
      success: true,
      data: startup,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new startup profile
 * @route   POST /api/startups
 */
const createStartup = async (req, res, next) => {
  try {
    const {
      companyName,
      industry,
      stage,
      founder,
      website,
      location,
      description,
      pipelineStage,
    } = req.body;

    const startup = await Startup.create({
      companyName,
      industry,
      stage: stage || 'Seed',
      founder: {
        name: founder.name,
        background: founder.background || '',
      },
      website: website || '',
      location: location || '',
      description: description || '',
      pipelineStage: pipelineStage || 'DISCOVERED',
      decision: {
        status: 'UNDER_EVALUATION',
        comment: '',
        decidedBy: 'Investment Analyst',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Startup profile created successfully',
      data: startup,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update startup profile details
 * @route   PUT /api/startups/:id
 */
const updateStartup = async (req, res, next) => {
  try {
    const {
      companyName,
      industry,
      stage,
      founder,
      website,
      location,
      description,
      pipelineStage,
    } = req.body;

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
    if (founder && founder.name) {
      startup.founder.name = founder.name;
      if (founder.background !== undefined) startup.founder.background = founder.background;
    }
    if (website !== undefined) startup.website = website;
    if (location !== undefined) startup.location = location;
    if (description !== undefined) startup.description = description;
    if (pipelineStage) startup.pipelineStage = pipelineStage;

    const updatedStartup = await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup updated successfully',
      data: updatedStartup,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete startup profile
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
      message: `Startup '${startup.companyName}' deleted successfully`,
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update founder evaluation scores (auto-computes overall founder score server-side)
 * @route   PUT /api/startups/:id/evaluation
 */
const updateEvaluation = async (req, res, next) => {
  try {
    const { experience, domainExpertise, execution, vision, teamStrength } = req.body;

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID ${req.params.id}`,
      });
    }

    const overallScore = calculateFounderScore({
      experience,
      domainExpertise,
      execution,
      vision,
      teamStrength,
    });

    if (overallScore === null) {
      return res.status(400).json({
        success: false,
        message: 'All 5 evaluation criteria must be valid numbers between 1 and 10',
      });
    }

    startup.evaluation = {
      experience: Number(experience),
      domainExpertise: Number(domainExpertise),
      execution: Number(execution),
      vision: Number(vision),
      teamStrength: Number(teamStrength),
      overallScore,
      updatedAt: new Date(),
    };

    recalculateScorecard(startup);

    const updated = await startup.save();

    res.status(200).json({
      success: true,
      message: 'Founder evaluation recorded and overall score computed successfully',
      data: updated,
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
      investmentThesis,
    } = req.body;

    startup.analysis = {
      marketOpportunity: marketOpportunity || '',
      marketScore: marketScore !== undefined ? Number(marketScore) : undefined,
      businessModel: businessModel || '',
      businessModelScore: businessModelScore !== undefined ? Number(businessModelScore) : undefined,
      competitiveLandscape: competitiveLandscape || '',
      competitionScore: competitionScore !== undefined ? Number(competitionScore) : undefined,
      revenue: revenue || '',
      growthPotential: growthPotential || '',
      growthScore: growthScore !== undefined ? Number(growthScore) : undefined,
      keyRisks: keyRisks || '',
      riskScore: riskScore !== undefined ? Number(riskScore) : undefined,
      investmentThesis: investmentThesis || '',
      updatedAt: new Date(),
    };

    recalculateScorecard(startup);

    const updated = await startup.save();

    res.status(200).json({
      success: true,
      message: 'Investment analysis updated successfully',
      data: updated,
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

    startup.decision = {
      status,
      comment: comment || '',
      decidedBy: decidedBy || 'Investment Analyst',
      decidedAt: new Date(),
    };

    const updated = await startup.save();

    res.status(200).json({
      success: true,
      message: `Decision updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk create startups from Excel/CSV import
 * @route   POST /api/startups/bulk
 * @access  Public
 */
const bulkCreateStartups = async (req, res, next) => {
  try {
    const { startups: items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No startups data provided for bulk import',
      });
    }

    const created = [];
    const failed = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        if (!item.companyName || !item.founder?.name) {
          failed.push({
            row: i + 1,
            companyName: item.companyName || 'Row ' + (i + 1),
            reason: 'Missing required company name or founder name',
          });
          continue;
        }

        const newStartup = new Startup({
          companyName: item.companyName.trim(),
          industry: item.industry || 'Fintech',
          stage: item.stage || 'Seed',
          founder: {
            name: item.founder.name.trim(),
            background: item.founder.background ? item.founder.background.trim() : 'Track record not specified',
          },
          website: item.website ? item.website.trim() : undefined,
          location: item.location ? item.location.trim() : 'Location not specified',
          description: item.description ? item.description.trim() : 'Imported startup profile',
          pipelineStage: item.pipelineStage || 'DISCOVERED',
          decision: {
            status: item.decisionStatus || 'UNDER_EVALUATION',
            comment: 'Imported via Bulk Upload',
            decidedAt: new Date(),
          },
        });

        const saved = await newStartup.save();
        created.push(saved);
      } catch (err) {
        failed.push({
          row: i + 1,
          companyName: item.companyName || 'Row ' + (i + 1),
          reason: err.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${created.length} startups`,
      importedCount: created.length,
      failedCount: failed.length,
      data: created,
      failed,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStartups,
  getStartupById,
  createStartup,
  bulkCreateStartups,
  updateStartup,
  deleteStartup,
  updateEvaluation,
  updateAnalysis,
  updateDecision,
};

