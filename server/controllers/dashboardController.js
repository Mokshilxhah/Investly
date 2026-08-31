const Startup = require('../models/Startup');

/**
 * @desc    Get aggregated dashboard analytics and pipeline metrics directly from MongoDB
 * @route   GET /api/dashboard
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalStartups = await Startup.countDocuments();
    const underEvaluation = await Startup.countDocuments({ 'decision.status': 'UNDER_EVALUATION' });
    const invested = await Startup.countDocuments({ 'decision.status': 'INVEST' });
    const watchlist = await Startup.countDocuments({ 'decision.status': 'WATCHLIST' });
    const rejected = await Startup.countDocuments({ 'decision.status': 'REJECT' });

    // Dynamic aggregation for Average Founder Score
    const avgFounderResult = await Startup.aggregate([
      { $match: { 'evaluation.overallScore': { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$evaluation.overallScore' } } },
    ]);
    const avgFounderScore = avgFounderResult.length > 0
      ? Math.round(avgFounderResult[0].avg * 10) / 10
      : 0;

    // Dynamic aggregation for Average Overall Investment Score
    const avgInvestmentResult = await Startup.aggregate([
      { $match: { 'scorecard.overallInvestmentScore': { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$scorecard.overallInvestmentScore' } } },
    ]);
    const avgInvestmentScore = avgInvestmentResult.length > 0
      ? Math.round(avgInvestmentResult[0].avg * 10) / 10
      : 0;

    // Pipeline stage counts
    const discoveredCount = await Startup.countDocuments({ pipelineStage: 'DISCOVERED', 'decision.status': 'UNDER_EVALUATION' });
    const underReviewCount = await Startup.countDocuments({ pipelineStage: 'UNDER_REVIEW', 'decision.status': 'UNDER_EVALUATION' });
    const evaluationCount = await Startup.countDocuments({ pipelineStage: 'EVALUATION', 'decision.status': 'UNDER_EVALUATION' });
    const committeeCount = await Startup.countDocuments({ pipelineStage: 'COMMITTEE', 'decision.status': 'UNDER_EVALUATION' });
    const decidedCount = await Startup.countDocuments({ 'decision.status': { $in: ['INVEST', 'WATCHLIST', 'REJECT'] } });

    const pipelineStages = [
      { id: 'discovered', label: 'Discovered', count: discoveredCount },
      { id: 'under_review', label: 'Under Review', count: underReviewCount },
      { id: 'evaluation', label: 'Evaluation', count: evaluationCount },
      { id: 'committee', label: 'Investment Committee', count: committeeCount },
      { id: 'decided', label: 'Decided', count: decidedCount },
    ];

    // Top Investment Opportunities (Top 5 by overall score, fallback to founder score)
    const topOpportunities = await Startup.find({
      $or: [
        { 'scorecard.overallInvestmentScore': { $exists: true, $ne: null } },
        { 'evaluation.overallScore': { $exists: true, $ne: null } }
      ]
    })
      .sort({ 'scorecard.overallInvestmentScore': -1, 'evaluation.overallScore': -1 })
      .limit(5)
      .select('companyName industry stage scorecard evaluation decision');

    // Recent Activity / Updates feed
    const recentStartups = await Startup.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('companyName industry stage decision scorecard updatedAt createdAt pipelineStage');

    const recentActivity = recentStartups.map((s) => {
      let text = '';
      let type = 'stage_move'; // default

      if (s.decision?.status === 'INVEST') {
        text = `${s.companyName} approved for investment ($${s.stage})`;
        type = 'invest';
      } else if (s.decision?.status === 'WATCHLIST') {
        text = `${s.companyName} added to active watchlist for monitoring`;
        type = 'watchlist';
      } else if (s.decision?.status === 'REJECT') {
        text = `${s.companyName} evaluation finalized: Rejected`;
        type = 'reject';
      } else if (s.pipelineStage === 'EVALUATION') {
        text = `${s.companyName} advanced to deep founder & financial evaluation`;
        type = 'stage_move';
      } else if (s.pipelineStage === 'COMMITTEE') {
        text = `${s.companyName} submitted to Investment Committee`;
        type = 'stage_move';
      } else if (s.pipelineStage === 'UNDER_REVIEW') {
        text = `${s.companyName} initial intake review started`;
        type = 'stage_move';
      } else {
        text = `${s.companyName} added to deal sourcing pipeline`;
        type = 'stage_move';
      }

      return {
        id: s._id,
        companyName: s.companyName,
        text,
        type,
        timestamp: s.updatedAt || s.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalStartups,
        underEvaluation,
        invested,
        watchlist,
        rejected,
        avgFounderScore,
        avgInvestmentScore,
        pipelineStages,
        topOpportunities,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardMetrics,
};
