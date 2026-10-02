const fs = require('fs');
const path = require('path');
const db = require('../models/db');

// @desc    Get lesson details by Course ID and Lesson ID
// @route   GET /api/courses/:courseId/lessons/:lessonId
// @access  Public / Protected (checks enrollment for non-preview)
exports.getLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const course = db.Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    let foundLesson = null;
    let foundModule = null;

    if (course.modules) {
      for (const mod of course.modules) {
        if (mod.lessons) {
          const l = mod.lessons.find(item => item.id === lessonId || item._id === lessonId);
          if (l) {
            foundLesson = l;
            foundModule = mod;
            break;
          }
        }
      }
    }

    if (!foundLesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found in course.' });
    }

    // Check if user has access (preview is public, otherwise must be enrolled or course author or admin)
    const isAuthor = req.user && (course.instructorId === req.user._id || req.user.role === 'admin');
    let isEnrolled = false;
    let progress = null;

    if (req.user) {
      const enrollment = db.Enrollments.findOne({ courseId, userId: req.user._id });
      if (enrollment) {
        isEnrolled = true;
        progress = enrollment.progressData ? enrollment.progressData[lessonId] : null;
      }
    }

    if (!foundLesson.preview && !isEnrolled && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You must enroll in this course to access this lesson.'
      });
    }

    res.status(200).json({
      success: true,
      lesson: foundLesson,
      module: { id: foundModule.id, title: foundModule.title },
      course: { id: course._id, title: course.title },
      savedProgress: progress || { completed: false, lastWatchedTime: 0 }
    });
  } catch (err) {
    console.error('getLesson error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving lesson.' });
  }
};

// @desc    HTTP 206 Partial Content Video Streaming for local video files
// @route   GET /api/courses/stream/:filename
// @access  Public
exports.streamVideo = (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ success: false, message: 'Video file not found.' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error('streamVideo error:', err);
    res.status(500).json({ success: false, message: 'Error streaming video file.' });
  }
};
