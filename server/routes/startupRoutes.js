const express = require('express');
const router = express.Router();
const {
  getStartups,
  getStartupById,
  createStartup,
  bulkCreateStartups,
  updateStartup,
  deleteStartup,
  updateEvaluation,
  updateAnalysis,
  updateDecision,
  advanceStage,
  getPipeline,
  getBottleneckStats,
  seedDemoDatabase,
} = require('../controllers/startupController');
const {
  validateStartupPayload,
  sanitizeClientScoreInput,
} = require('../middleware/validateRequest');

router.route('/seed')
  .post(seedDemoDatabase);

router.route('/bulk')
  .post(bulkCreateStartups);

router.route('/pipeline')
  .get(getPipeline);

router.route('/pipeline/bottleneck')
  .get(getBottleneckStats);

router.route('/')
  .get(getStartups)
  .post(validateStartupPayload, sanitizeClientScoreInput, createStartup);

router.route('/:id')
  .get(getStartupById)
  .put(validateStartupPayload, sanitizeClientScoreInput, updateStartup)
  .delete(deleteStartup);

router.route('/:id/advance-stage')
  .post(advanceStage);

router.route('/:id/evaluation')
  .put(updateEvaluation);

router.route('/:id/analysis')
  .put(updateAnalysis);

router.route('/:id/decision')
  .put(updateDecision);

module.exports = router;
