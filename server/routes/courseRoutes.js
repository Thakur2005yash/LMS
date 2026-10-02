const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFeatured
} = require('../controllers/courseController');
const { getLesson, streamVideo } = require('../controllers/lessonController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.get('/featured', getFeatured);
router.get('/stream/:filename', streamVideo);
router.get('/', getCourses);
router.get('/:id', optionalAuth, getCourseById);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Nested lesson routes
router.get('/:courseId/lessons/:lessonId', optionalAuth, getLesson);

module.exports = router;
