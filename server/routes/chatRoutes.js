const express = require('express');
const router = express.Router();
const { handleChatQuery } = require('../controllers/chatController');

router.post('/', handleChatQuery);

module.exports = router;
