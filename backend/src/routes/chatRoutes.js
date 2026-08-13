const express = require('express');
const { chatMessage } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, chatMessage);

module.exports = router;
