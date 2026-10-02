const express = require('express');
const router = express.Router();
const {
  getProgress,
  updateVideoProgress,
  toggleLessonCompletion
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId', protect, getProgress);
router.post('/:courseId/video', protect, updateVideoProgress);
router.post('/:courseId/toggle-lesson', protect, toggleLessonCompletion);

module.exports = router;
