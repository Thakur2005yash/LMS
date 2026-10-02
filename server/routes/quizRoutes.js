const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, createQuiz } = require('../controllers/quizController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.get('/:courseId', optionalAuth, getQuiz);
router.post('/:courseId/submit', protect, submitQuiz);
router.post('/', protect, authorize('instructor', 'admin'), createQuiz);

module.exports = router;
