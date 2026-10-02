const express = require('express');
const router = express.Router();
const {
  getStats,
  getMyCourses,
  getCourseStudents
} = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('instructor', 'admin'));

router.get('/stats', getStats);
router.get('/courses', getMyCourses);
router.get('/courses/:courseId/students', getCourseStudents);

module.exports = router;
