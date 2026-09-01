const Startup = require('../models/Startup');

/**
 * @desc    Get aggregated dashboard analytics and pipeline metrics directly from MongoDB
 * @route   GET /api/dashboard
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalStartups = await Startup.countDocuments();
    const underEvaluation = await Startup.countDocuments({
      'decision.status': 'UNDER_EVALUATION',
    });
    const invested = await Startup.countDocuments({ 'decision.status': 'INVEST' });
    const watchlist = await Startup.countDocuments({ 'decision.status': 'WATCHLIST' });
    const rejected = await Startup.countDocuments({ 'decision.status': 'REJECT' });

    // Dynamic aggregation for Average Founder Score (only counts evaluated startups with score > 0)
    const avgFounderResult = await Startup.aggregate([
      { $match: { 'evaluation.overallScore': { $exists: true, $ne: null, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$evaluation.overallScore' } } },
    ]);
    const avgFounderScore = avgFounderResult.length > 0
      ? Math.round(avgFounderResult[0].avg * 10) / 10
      : 0;

    // Dynamic aggregation for Average Overall Investment Score (only counts evaluated startups with score > 0)
    const avgInvestmentResult = await Startup.aggregate([
      { $match: { 'scorecard.overallInvestmentScore': { $exists: true, $ne: null, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$scorecard.overallInvestmentScore' } } },
    ]);
    const avgInvestmentScore = avgInvestmentResult.length > 0
      ? Math.round(avgInvestmentResult[0].avg * 10) / 10
      : 0;

    // Pipeline stage counts
    const discoveredCount = await Startup.countDocuments({ pipelineStage: 'Discovered' });
    const screeningCount = await Startup.countDocuments({ pipelineStage: 'Screening' });
    const deepDiveCount = await Startup.countDocuments({ pipelineStage: 'Deep Dive' });
    const committeeCount = await Startup.countDocuments({ pipelineStage: 'Committee' });
    const closedCount = await Startup.countDocuments({ pipelineStage: 'Closed' });

    const pipelineStages = [
      { id: 'Discovered', label: 'Discovered', count: discoveredCount },
      { id: 'Screening', label: 'Screening', count: screeningCount },
      { id: 'Deep Dive', label: 'Deep Dive', count: deepDiveCount },
      { id: 'Committee', label: 'Committee', count: committeeCount },
      { id: 'Closed', label: 'Closed', count: closedCount },
    ];

    // Top Investment Opportunities: High-conviction deals (Score >= 8.0 or INVEST decision)
    const topOpportunities = await Startup.find({
      $or: [
        { 'scorecard.overallInvestmentScore': { $gte: 8.0 } },
        { 'decision.status': 'INVEST' },
        { 'evaluation.overallScore': { $gte: 8.0 } },
      ],
    })
      .sort({ 'scorecard.overallInvestmentScore': -1, 'evaluation.overallScore': -1, updatedAt: -1 })
      .limit(6)
      .select('companyName industry stage scorecard evaluation decision pipelineStage');

    // Recent Activity / Updates feed
    const recentStartups = await Startup.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('companyName industry stage decision scorecard updatedAt createdAt pipelineStage');

    const recentActivity = recentStartups.map((s) => {
      let text = '';
      let type = 'stage_move';

      if (s.decision?.status === 'INVEST') {
        text = `${s.companyName} approved for investment (${s.stage || 'Seed'})`;
        type = 'invest';
      } else if (s.decision?.status === 'WATCHLIST') {
        text = `${s.companyName} added to active watchlist for monitoring`;
        type = 'watchlist';
      } else if (s.decision?.status === 'REJECT') {
        text = `${s.companyName} evaluation finalized: Rejected`;
        type = 'reject';
      } else if (s.pipelineStage === 'Screening') {
        text = `${s.companyName} advanced to Screening stage`;
        type = 'stage_move';
      } else if (s.pipelineStage === 'Deep Dive') {
        text = `${s.companyName} advanced to Deep Dive evaluation`;
        type = 'stage_move';
      } else if (s.pipelineStage === 'Committee') {
        text = `${s.companyName} submitted to Investment Committee`;
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
        startupsUnderEvaluation: underEvaluation,
        invested,
        investedStartups: invested,
        watchlist,
        watchlistStartups: watchlist,
        rejected,
        rejectedStartups: rejected,
        avgFounderScore,
        averageFounderScore: avgFounderScore,
        avgInvestmentScore,
        averageInvestmentScore: avgInvestmentScore,
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
