const db = require('../models/db');

// @desc    Get instructor performance analytics & statistics
// @route   GET /api/instructor/stats
// @access  Private (Instructor or Admin)
exports.getStats = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Get courses created by this instructor
    const courses = db.Courses.find(c => c.instructorId === instructorId || req.user.role === 'admin');
    const courseIds = courses.map(c => c._id);

    // Get enrollments across these courses
    const enrollments = db.Enrollments.find(e => courseIds.includes(e.courseId));

    // Calculate revenue
    const totalRevenue = enrollments.reduce((sum, e) => {
      return sum + ((e.payment && e.payment.amount) || 0);
    }, 0);

    // Average rating
    let totalRating = 0;
    let ratedCount = 0;
    courses.forEach(c => {
      if (c.rating) {
        totalRating += c.rating;
        ratedCount++;
      }
    });
    const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '5.0';

    // Total lessons created
    let totalLessonsCount = 0;
    courses.forEach(c => {
      if (c.modules) {
        c.modules.forEach(m => {
          if (m.lessons) totalLessonsCount += m.lessons.length;
        });
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents: enrollments.length,
        totalRevenue: Math.round(totalRevenue),
        averageRating: parseFloat(avgRating),
        totalLessons: totalLessonsCount
      },
      recentEnrollments: enrollments.slice(-5).reverse().map(e => {
        const student = db.Users.findById(e.userId);
        return {
          id: e._id,
          studentName: student ? student.name : 'Learner',
          studentAvatar: student ? student.avatar : '',
          courseTitle: e.courseTitle,
          enrolledAt: e.enrolledAt,
          progress: e.progress,
          amount: e.payment ? e.payment.amount : 0
        };
      })
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving instructor stats.' });
  }
};

// @desc    Get courses managed by the instructor
// @route   GET /api/instructor/courses
// @access  Private (Instructor or Admin)
exports.getMyCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = db.Courses.find(c => c.instructorId === instructorId || req.user.role === 'admin');

    // Add student count & revenue per course
    const enriched = courses.map(c => {
      const enrollments = db.Enrollments.find({ courseId: c._id });
      const revenue = enrollments.reduce((sum, e) => sum + ((e.payment && e.payment.amount) || 0), 0);
      return {
        ...c,
        studentsCount: enrollments.length,
        revenue
      };
    });

    res.status(200).json({
      success: true,
      courses: enriched
    });
  } catch (err) {
    console.error('getMyCourses error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving instructor courses.' });
  }
};

// @desc    Get enrolled students list for an instructor's course
// @route   GET /api/instructor/courses/:courseId/students
// @access  Private (Instructor or Admin)
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = db.Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course.instructorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const enrollments = db.Enrollments.find({ courseId });

    const students = enrollments.map(e => {
      const user = db.Users.findById(e.userId);
      return {
        enrollmentId: e._id,
        userId: e.userId,
        name: user ? user.name : 'Student',
        email: user ? user.email : '',
        avatar: user ? user.avatar : '',
        enrolledAt: e.enrolledAt,
        progress: e.progress,
        isCompleted: e.isCompleted,
        lastAccessedAt: e.lastAccessedAt
      };
    });

    res.status(200).json({
      success: true,
      students
    });
  } catch (err) {
    console.error('getCourseStudents error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving students.' });
  }
};
