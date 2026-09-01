/**
 * Pipeline Stage Gating & Risk Veto Engine
 * Single source of truth for stage transitions and threshold checks.
 */

const PIPELINE_STAGES = ['Discovered', 'Screening', 'Deep Dive', 'Committee', 'Closed'];

/**
 * Identify the weakest dimension from founder evaluation.
 */
function getWeakestDimension(evaluation = {}) {
  const dims = [
    { key: 'experience', name: 'Relevant Experience' },
    { key: 'domainExpertise', name: 'Domain Expertise' },
    { key: 'execution', name: 'Execution & Velocity' },
    { key: 'vision', name: 'Vision & Leadership' },
    { key: 'teamStrength', name: 'Team Strength' },
  ];

  let weakest = null;
  let minScore = Infinity;

  dims.forEach((d) => {
    const val = Number(evaluation[d.key]);
    if (!isNaN(val) && val < minScore) {
      minScore = val;
      weakest = `${d.name} (${val}/10)`;
    }
  });

  return weakest || 'General evaluation';
}

/**
 * Identify the weakest dimension from overall scorecard.
 */
function getWeakestScorecardDimension(scorecard = {}) {
  const dims = [
    { key: 'founderScore', name: 'Founder & Team' },
    { key: 'marketScore', name: 'Market Opportunity' },
    { key: 'businessModelScore', name: 'Business Model' },
    { key: 'growthScore', name: 'Growth Potential' },
    { key: 'competitionScore', name: 'Competitive Moat' },
    { key: 'riskScore', name: 'Risk Mitigation' },
  ];

  let weakest = null;
  let minScore = Infinity;

  dims.forEach((d) => {
    const val = Number(scorecard[d.key]);
    if (!isNaN(val) && val < minScore) {
      minScore = val;
      weakest = `${d.name} (${val}/10)`;
    }
  });

  return weakest || 'General scorecard';
}

/**
 * Apply Risk Veto logic:
 * - A HIGH founder risk blocks advancement outright
 * - 2 or more HIGH risks caps recommendation to WATCHLIST/REJECT
 */
function applyRiskVeto(overallScore, riskCategories = {}) {
  const { founderRisk, marketRisk, executionRisk, financialRisk, competitiveRisk } = riskCategories;

  // 1. Founder Risk Veto
  if (founderRisk === 'HIGH') {
    return {
      vetoTriggered: true,
      reason: 'Critical Founder Risk flag is HIGH. This overrides the score and blocks Committee advancement.',
      recommendation: 'REJECT',
    };
  }

  // Count total HIGH risks
  const highRisks = [founderRisk, marketRisk, executionRisk, financialRisk, competitiveRisk].filter(
    (r) => r === 'HIGH'
  ).length;

  if (highRisks >= 2) {
    return {
      vetoTriggered: true,
      reason: `Multiple critical risk categories marked HIGH (${highRisks} flags). Advancing to Committee is restricted.`,
      recommendation: overallScore >= 6.0 ? 'WATCHLIST' : 'REJECT',
    };
  }

  return {
    vetoTriggered: false,
    reason: '',
    recommendation: null,
  };
}

/**
 * Determine if a startup is allowed to advance to the next pipeline stage.
 * @param {Object} startup - The full startup document
 * @returns {Object} { allowed: Boolean, reason?: String, weakestDimension?: String, nextStage?: String }
 */
function canAdvance(startup) {
  const currentStage = startup.pipelineStage || 'Discovered';
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === PIPELINE_STAGES.length - 1) {
    return {
      allowed: false,
      reason: 'Startup is already closed or in an invalid stage.',
    };
  }

  const nextStage = PIPELINE_STAGES[currentIndex + 1];

  switch (currentStage) {
    case 'Discovered': {
      // Discovered -> Screening: Manual move, always allowed
      return {
        allowed: true,
        nextStage,
      };
    }

    case 'Screening': {
      // Screening -> Deep Dive: Requires founderScore >= 5.0
      const score = startup.evaluation?.overallScore;
      if (score === undefined || score === null) {
        return {
          allowed: false,
          reason: 'Founder evaluation not yet completed. Complete all 5 scores to compute founder score.',
          weakestDimension: 'Founder evaluation pending',
          nextStage,
        };
      }
      if (score < 5.0) {
        const weakest = getWeakestDimension(startup.evaluation);
        return {
          allowed: false,
          reason: `Founder score is ${score.toFixed(1)}/10 — requires at least 5.0/10 to enter Deep Dive.`,
          weakestDimension: weakest,
          nextStage,
        };
      }
      return {
        allowed: true,
        nextStage,
      };
    }

    case 'Deep Dive': {
      // Deep Dive -> Committee: Requires overallInvestmentScore >= 6.0 AND no risk veto
      const overallScore = startup.scorecard?.overallInvestmentScore;
      if (overallScore === undefined || overallScore === null) {
        return {
          allowed: false,
          reason: 'Investment analysis not completed. Rate the 5 dimensions to calculate overall score.',
          weakestDimension: 'Analysis pending',
          nextStage,
        };
      }

      const veto = applyRiskVeto(overallScore, startup.analysis?.riskCategories);
      if (veto.vetoTriggered) {
        return {
          allowed: false,
          reason: veto.reason,
          weakestDimension: 'Risk Veto Triggered',
          nextStage,
        };
      }

      if (overallScore < 6.0) {
        const weakest = getWeakestScorecardDimension(startup.scorecard);
        return {
          allowed: false,
          reason: `Overall score is ${overallScore.toFixed(1)}/10 — requires at least 6.0/10 to reach Committee.`,
          weakestDimension: weakest,
          nextStage,
        };
      }

      return {
        allowed: true,
        nextStage,
      };
    }

    case 'Committee': {
      // Committee -> Closed: Requires a decision status other than UNDER_EVALUATION
      const status = startup.decision?.status;
      if (!status || status === 'UNDER_EVALUATION') {
        return {
          allowed: false,
          reason: 'A final decision (INVEST, WATCHLIST, or REJECT) must be recorded to close out this startup.',
          weakestDimension: 'Final Decision Pending',
          nextStage,
        };
      }
      return {
        allowed: true,
        nextStage,
      };
    }

    default:
      return {
        allowed: false,
        reason: 'Unknown stage',
      };
  }
}

module.exports = {
  PIPELINE_STAGES,
  getWeakestDimension,
  getWeakestScorecardDimension,
  applyRiskVeto,
  canAdvance,
};
