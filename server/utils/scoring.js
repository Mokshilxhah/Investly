/**
 * Centralized scoring logic and decision engine utilities.
 * Single source of truth for all mathematical calculations.
 */

// Weight constants for overall investment score calculation
const WEIGHTS = {
  founder: 0.30,
  market: 0.20,
  growth: 0.20,
  businessModel: 0.15,
  competition: 0.10,
  risk: 0.05,
};

/**
 * Calculate founder overall score from 5 individual dimensions.
 * @param {Object} evalData - { experience, domainExpertise, execution, vision, teamStrength }
 * @returns {Number|null} - Rounded to 1 decimal place or null if incomplete
 */
const calculateFounderScore = (evalData = {}) => {
  const { experience, domainExpertise, execution, vision, teamStrength } = evalData;
  const values = [experience, domainExpertise, execution, vision, teamStrength].map(Number);

  if (values.some(v => isNaN(v) || v < 1 || v > 10)) {
    return null;
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  return Math.round(avg * 10) / 10;
};

/**
 * Calculate the overall investment score from weighted sub-scores.
 * @param {Object} scores - { founderScore, marketScore, businessModelScore, growthScore, competitionScore, riskScore }
 * @returns {Number|null} - Rounded to 1 decimal place
 */
const calculateOverallInvestmentScore = (scores = {}) => {
  const {
    founderScore,
    marketScore,
    businessModelScore,
    growthScore,
    competitionScore,
    riskScore,
  } = scores;

  const validScores = {
    founder: Number(founderScore),
    market: Number(marketScore),
    businessModel: Number(businessModelScore),
    growth: Number(growthScore),
    competition: Number(competitionScore),
    risk: Number(riskScore),
  };

  for (const key of Object.keys(validScores)) {
    if (isNaN(validScores[key]) || validScores[key] < 1 || validScores[key] > 10) {
      return null;
    }
  }

  const weightedSum =
    (validScores.founder * WEIGHTS.founder) +
    (validScores.market * WEIGHTS.market) +
    (validScores.businessModel * WEIGHTS.businessModel) +
    (validScores.growth * WEIGHTS.growth) +
    (validScores.competition * WEIGHTS.competition) +
    (validScores.risk * WEIGHTS.risk);

  return Math.round(weightedSum * 10) / 10;
};

/**
 * Determine the system recommendation based on overall investment score.
 * @param {Number} overallScore
 * @returns {'INVEST'|'WATCHLIST'|'REJECT'|'PENDING'}
 */
const getSystemRecommendation = (overallScore) => {
  if (overallScore === null || overallScore === undefined || isNaN(overallScore)) {
    return 'PENDING';
  }
  if (overallScore >= 8.0) return 'INVEST';
  if (overallScore >= 6.0) return 'WATCHLIST';
  return 'REJECT';
};

/**
 * Generate rule-based decision explanation: strengths, concerns, and confidence.
 * @param {Object} scores
 * @returns {Object} { strengths: string[], concerns: string[], confidence: string }
 */
const generateDecisionExplanation = (scores = {}) => {
  const {
    founderScore,
    marketScore,
    businessModelScore,
    growthScore,
    competitionScore,
    riskScore,
    overallInvestmentScore,
  } = scores;

  const strengths = [];
  const concerns = [];

  const dimensions = [
    { name: 'Founder & Team Strength', score: founderScore },
    { name: 'Market Opportunity & TAM', score: marketScore },
    { name: 'Business Model & Unit Economics', score: businessModelScore },
    { name: 'Growth Potential & Scalability', score: growthScore },
    { name: 'Competitive Moat & Advantage', score: competitionScore },
    { name: 'Risk Mitigation & Defensibility', score: riskScore },
  ];

  dimensions.forEach(dim => {
    const val = Number(dim.score);
    if (!isNaN(val)) {
      if (val >= 8.0) {
        strengths.push(`High ${dim.name} rating (${val}/10)`);
      } else if (val <= 5.0) {
        concerns.push(`Low ${dim.name} rating (${val}/10)`);
      }
    }
  });

  // Calculate confidence rating
  let confidence = 'MEDIUM';
  if (founderScore !== null && overallInvestmentScore !== null) {
    if (
      (founderScore >= 7.5 && overallInvestmentScore >= 7.5) ||
      (founderScore < 6.0 && overallInvestmentScore < 6.0)
    ) {
      confidence = 'HIGH';
    } else if (Math.abs(founderScore - overallInvestmentScore) > 2.5) {
      confidence = 'LOW';
    }
  }

  return {
    strengths,
    concerns,
    confidence,
  };
};

module.exports = {
  WEIGHTS,
  calculateFounderScore,
  calculateOverallInvestmentScore,
  getSystemRecommendation,
  generateDecisionExplanation,
};
