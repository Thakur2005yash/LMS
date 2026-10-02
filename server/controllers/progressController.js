const db = require('../models/db');

// Calculate total lessons in course
const getCourseTotalLessons = (course) => {
  let count = 0;
  if (course && course.modules) {
    course.modules.forEach(m => {
      if (m.lessons) count += m.lessons.length;
    });
  }
  return count > 0 ? count : 1;
};

// @desc    Get user's progress for a specific course
// @route   GET /api/progress/:courseId
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = db.Enrollments.findOne({ courseId, userId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found for this course.' });
    }

    const course = db.Courses.findById(courseId);
    const totalLessons = getCourseTotalLessons(course);

    res.status(200).json({
      success: true,
      progress: {
        percentage: enrollment.progress || 0,
        completedLessons: enrollment.completedLessons || [],
        currentLessonId: enrollment.currentLessonId,
        lessonProgress: enrollment.lessonProgress || {},
        isCompleted: enrollment.isCompleted || false,
        totalLessons,
        completedCount: (enrollment.completedLessons || []).length
      }
    });
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving progress.' });
  }
};

// @desc    Update video playback time & auto-mark completion
// @route   POST /api/progress/:courseId/video
// @access  Private
exports.updateVideoProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, currentTime, duration, markComplete } = req.body;
    const userId = req.user._id;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'lessonId is required.' });
    }

    let enrollment = db.Enrollments.findOne({ courseId, userId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    }

    const lessonProgress = enrollment.lessonProgress || {};
    const currentLessonData = lessonProgress[lessonId] || { lastWatchedTime: 0, completed: false };

    // Update last watched time
    currentLessonData.lastWatchedTime = currentTime || currentLessonData.lastWatchedTime;
    currentLessonData.duration = duration || currentLessonData.duration;

    // Check if lesson should be marked complete (>= 90% watched or explicit flag)
    let completedLessons = [...(enrollment.completedLessons || [])];
    const shouldComplete = markComplete || (duration > 0 && currentTime >= duration * 0.9);

    if (shouldComplete && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      currentLessonData.completed = true;
    }

    lessonProgress[lessonId] = currentLessonData;

    // Recalculate overall course progress
    const course = db.Courses.findById(courseId);
    const totalLessons = getCourseTotalLessons(course);
    const progressPercent = Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));

    const isCourseDone = progressPercent === 100;

    const updatedEnrollment = db.Enrollments.findByIdAndUpdate(enrollment._id, {
      lessonProgress,
      completedLessons,
      currentLessonId: lessonId,
      progress: progressPercent,
      isCompleted: isCourseDone,
      completedAt: isCourseDone ? (enrollment.completedAt || new Date().toISOString()) : null,
      lastAccessedAt: new Date().toISOString()
    }, { new: true });

    // Award bonus user points on completion
    if (isCourseDone && !enrollment.isCompleted) {
      const user = db.Users.findById(userId);
      const points = (user.points || 0) + 250; // Course completion bonus!
      const badges = user.badges || [];
      if (!badges.includes('Course Finisher')) badges.push('Course Finisher');
      db.Users.findByIdAndUpdate(userId, { points, badges });
    }

    res.status(200).json({
      success: true,
      progress: updatedEnrollment.progress,
      completedLessons: updatedEnrollment.completedLessons,
      isCompleted: updatedEnrollment.isCompleted,
      lessonProgress: updatedEnrollment.lessonProgress
    });
  } catch (err) {
    console.error('updateVideoProgress error:', err);
    res.status(500).json({ success: false, message: 'Server error updating video progress.' });
  }
};

// @desc    Toggle lesson completion status manually
// @route   POST /api/progress/:courseId/toggle-lesson
// @access  Private
exports.toggleLessonCompletion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;
    const userId = req.user._id;

    let enrollment = db.Enrollments.findOne({ courseId, userId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    }

    let completedLessons = [...(enrollment.completedLessons || [])];
    const lessonProgress = enrollment.lessonProgress || {};
    const item = lessonProgress[lessonId] || { lastWatchedTime: 0, completed: false };

    if (completedLessons.includes(lessonId)) {
      // Unmark
      completedLessons = completedLessons.filter(id => id !== lessonId);
      item.completed = false;
    } else {
      // Mark complete
      completedLessons.push(lessonId);
      item.completed = true;
    }
    lessonProgress[lessonId] = item;

    const course = db.Courses.findById(courseId);
    const totalLessons = getCourseTotalLessons(course);
    const progressPercent = Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));
    const isCourseDone = progressPercent === 100;

    const updated = db.Enrollments.findByIdAndUpdate(enrollment._id, {
      completedLessons,
      lessonProgress,
      progress: progressPercent,
      isCompleted: isCourseDone,
      completedAt: isCourseDone ? (enrollment.completedAt || new Date().toISOString()) : null,
      lastAccessedAt: new Date().toISOString()
    }, { new: true });

    res.status(200).json({
      success: true,
      completed: item.completed,
      progress: updated.progress,
      completedLessons: updated.completedLessons,
      isCompleted: updated.isCompleted
    });
  } catch (err) {
    console.error('toggleLessonCompletion error:', err);
    res.status(500).json({ success: false, message: 'Server error toggling lesson status.' });
  }
};
