const express = require('express');
const router = express.Router();
const {
  getPipeline,
  getBottleneckStats,
} = require('../controllers/startupController');

router.get('/', getPipeline);
router.get('/bottleneck', getBottleneckStats);

module.exports = router;
