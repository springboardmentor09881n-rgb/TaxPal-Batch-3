const express = require('express');
const { chatMessage } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, chatMessage);

module.exports = router;
