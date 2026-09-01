/**
 * Middleware for validating startup creation and update payloads.
 */
const validateStartupPayload = (req, res, next) => {
  const isCreate = req.method === 'POST';
  const { companyName, industry, stage, founder } = req.body;
  const errors = [];

  if (isCreate) {
    if (!companyName || !companyName.trim()) {
      errors.push('Company name is required');
    }
    if (!industry || !industry.trim()) {
      errors.push('Industry is required');
    }
    if (!founder || typeof founder !== 'object' || !founder.name || !founder.name.trim()) {
      errors.push('Founder name is required');
    }
  } else {
    if (companyName !== undefined && !companyName.trim()) {
      errors.push('Company name cannot be empty');
    }
    if (industry !== undefined && !industry.trim()) {
      errors.push('Industry cannot be empty');
    }
    if (founder !== undefined && (typeof founder !== 'object' || !founder.name?.trim())) {
      errors.push('Founder name cannot be empty');
    }
  }

  const validStages = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'];
  if (stage && !validStages.includes(stage)) {
    errors.push(`Stage must be one of: ${validStages.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Middleware to reject client attempts to manually submit overallScore or scorecard.
 */
const sanitizeClientScoreInput = (req, res, next) => {
  if (req.body.evaluation && req.body.evaluation.overallScore !== undefined) {
    delete req.body.evaluation.overallScore;
  }
  if (req.body.scorecard && req.body.scorecard.overallInvestmentScore !== undefined) {
    delete req.body.scorecard.overallInvestmentScore;
  }
  next();
};

module.exports = {
  validateStartupPayload,
  sanitizeClientScoreInput,
};
