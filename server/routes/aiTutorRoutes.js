const express = require('express');
const router = express.Router();
const { chatWithAiTutor } = require('../controllers/aiTutorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chatWithAiTutor);

module.exports = router;
