const db = require('../models/db');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, paymentMethod = 'credit_card' } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required.' });
    }

    const course = db.Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if already enrolled
    const existing = db.Enrollments.findOne({ courseId, userId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'You are already enrolled in this course.',
        enrollment: existing
      });
    }

    // Find first lesson to set as active/current
    let firstLessonId = null;
    if (course.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      firstLessonId = course.modules[0].lessons[0].id;
    }

    // Create enrollment
    const enrollment = db.Enrollments.create({
      userId,
      courseId,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail,
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      progress: 0, // 0 - 100 percentage
      completedLessons: [],
      currentLessonId: firstLessonId,
      lessonProgress: {}, // { [lessonId]: { lastWatchedTime: 0, completed: false } }
      quizScores: {},
      isCompleted: false,
      completedAt: null,
      certificateId: null,
      payment: {
        amount: course.price || 0,
        currency: 'USD',
        status: 'completed',
        transactionId: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        method: paymentMethod
      }
    });

    // Increment enrolled count on course
    const newEnrolledCount = (course.enrolledCount || 0) + 1;
    db.Courses.findByIdAndUpdate(courseId, { enrolledCount: newEnrolledCount });

    // Update user's enrolledCourses list
    const user = db.Users.findById(userId);
    const userEnrolled = user.enrolledCourses || [];
    if (!userEnrolled.includes(courseId)) {
      userEnrolled.push(courseId);
      db.Users.findByIdAndUpdate(userId, { enrolledCourses: userEnrolled });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment
    });
  } catch (err) {
    console.error('enrollCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error enrolling in course.' });
  }
};

// @desc    Get all enrollments for logged in user
// @route   GET /api/enrollments/my
// @access  Private
exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;
    const enrollments = db.Enrollments.find({ userId });

    // Enrich with current course info (in case title or thumbnail changed)
    const enriched = enrollments.map(e => {
      const course = db.Courses.findById(e.courseId);
      return {
        ...e,
        course: course || {
          title: e.courseTitle,
          thumbnail: e.courseThumbnail,
          instructorName: 'Instructor'
        }
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      enrollments: enriched
    });
  } catch (err) {
    console.error('getMyEnrollments error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching enrollments.' });
  }
};
