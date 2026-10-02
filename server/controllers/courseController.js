const db = require('../models/db');

// @desc    Get all courses with filtering, search, and sorting
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      rating,
      price,
      sort = 'popular',
      page = 1,
      limit = 12
    } = req.query;

    let courses = db.Courses.find();

    // Text search in title, subtitle, description, tags, instructorName
    if (search) {
      const term = search.toLowerCase().trim();
      courses = courses.filter(c =>
        (c.title && c.title.toLowerCase().includes(term)) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.instructorName && c.instructorName.toLowerCase().includes(term)) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(term)))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      courses = courses.filter(c => c.category && c.category.toLowerCase() === category.toLowerCase());
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      courses = courses.filter(c => c.difficulty && c.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Rating filter (e.g. 4+ stars)
    if (rating) {
      const minRating = parseFloat(rating);
      courses = courses.filter(c => (c.rating || 0) >= minRating);
    }

    // Price filter (free or paid)
    if (price) {
      if (price === 'free') {
        courses = courses.filter(c => !c.price || c.price === 0);
      } else if (price === 'paid') {
        courses = courses.filter(c => c.price && c.price > 0);
      }
    }

    // Sorting
    switch (sort) {
      case 'rating':
        courses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'price-low':
        courses.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        courses.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
      default:
        courses.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        break;
    }

    const total = courses.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCourses = courses.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      count: paginatedCourses.length,
      courses: paginatedCourses
    });
  } catch (err) {
    console.error('getCourses error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving courses.' });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public (Optional auth for enrollment status)
exports.getCourseById = async (req, res) => {
  try {
    const course = db.Courses.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    let isEnrolled = false;
    let enrollment = null;

    if (req.user) {
      enrollment = db.Enrollments.findOne({
        courseId: course._id,
        userId: req.user._id
      });
      isEnrolled = !!enrollment;
    }

    // Calculate total lessons and total duration
    let totalLessons = 0;
    let totalDurationSeconds = 0;

    if (course.modules && Array.isArray(course.modules)) {
      course.modules.forEach(mod => {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          totalLessons += mod.lessons.length;
          mod.lessons.forEach(l => {
            totalDurationSeconds += (l.duration || 0);
          });
        }
      });
    }

    // Attach instructor details
    let instructor = null;
    if (course.instructorId) {
      const instUser = db.Users.findById(course.instructorId);
      if (instUser) {
        instructor = {
          _id: instUser._id,
          name: instUser.name,
          avatar: instUser.avatar,
          bio: instUser.bio,
          headline: instUser.headline
        };
      }
    }

    // Attach reviews preview
    const reviews = db.Reviews.find({ courseId: course._id });

    res.status(200).json({
      success: true,
      course: {
        ...course,
        totalLessons,
        totalDurationSeconds,
        instructor: instructor || { name: course.instructorName || 'Lead Instructor' },
        isEnrolled,
        enrollmentId: enrollment ? enrollment._id : null,
        progress: enrollment ? enrollment.progress : 0,
        reviewsCount: reviews.length
      }
    });
  } catch (err) {
    console.error('getCourseById error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving course.' });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor or Admin)
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      subtitle = '',
      description = '',
      category = 'Development',
      difficulty = 'Beginner',
      price = 0,
      thumbnail = '',
      modules = [],
      tags = [],
      requirements = [],
      learningOutcomes = []
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Course title is required.' });
    }

    const defaultThumbnail = thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';

    const newCourse = db.Courses.create({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      category,
      difficulty,
      price: parseFloat(price) || 0,
      thumbnail: defaultThumbnail,
      instructorId: req.user._id,
      instructorName: req.user.name,
      instructorAvatar: req.user.avatar,
      rating: 5.0,
      ratingCount: 1,
      enrolledCount: 0,
      modules: modules.length > 0 ? modules : [
        {
          id: 'mod-1',
          title: 'Module 1: Introduction & Foundations',
          lessons: [
            {
              id: 'les-1',
              title: 'Welcome & Course Roadmap',
              duration: 300,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              preview: true,
              description: 'An overview of what we will build throughout this course.',
              resources: [{ name: 'Course Syllabus PDF', url: '#' }]
            }
          ]
        }
      ],
      tags: Array.isArray(tags) ? tags : [tags],
      requirements: Array.isArray(requirements) ? requirements : ['Basic computer literacy'],
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : ['Build production-grade applications']
    });

    // Add to instructor's created courses
    const user = db.Users.findById(req.user._id);
    const createdCourses = user.createdCourses || [];
    createdCourses.push(newCourse._id);
    db.Users.findByIdAndUpdate(req.user._id, { createdCourses });

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: newCourse
    });
  } catch (err) {
    console.error('createCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error creating course.' });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Owner Instructor or Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = db.Courses.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course.instructorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course.' });
    }

    const updated = db.Courses.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course: updated
    });
  } catch (err) {
    console.error('updateCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error updating course.' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Owner Instructor or Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = db.Courses.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course.instructorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course.' });
    }

    db.Courses.findByIdAndDelete(req.params.id);
    // Also cleanup enrollments and quizzes linked to this course
    db.Enrollments.deleteMany({ courseId: req.params.id });
    db.Quizzes.deleteMany({ courseId: req.params.id });
    db.Reviews.deleteMany({ courseId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Course and related data removed successfully.'
    });
  } catch (err) {
    console.error('deleteCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting course.' });
  }
};

// @desc    Get featured and trending highlights
// @route   GET /api/courses/featured
// @access  Public
exports.getFeatured = async (req, res) => {
  try {
    const all = db.Courses.find();
    const trending = [...all].sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0)).slice(0, 4);
    const topRated = [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    const newest = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

    const categories = [
      { name: 'Web Development', count: all.filter(c => c.category === 'Development').length, icon: 'Code' },
      { name: 'Data Science & AI', count: all.filter(c => c.category === 'Data Science').length, icon: 'Cpu' },
      { name: 'UI/UX Design', count: all.filter(c => c.category === 'Design').length, icon: 'Palette' },
      { name: 'Cloud & DevOps', count: all.filter(c => c.category === 'DevOps').length, icon: 'Cloud' },
      { name: 'Business & Management', count: all.filter(c => c.category === 'Business').length, icon: 'TrendingUp' }
    ];

    res.status(200).json({
      success: true,
      featured: trending[0] || all[0] || null,
      trending,
      topRated,
      newest,
      categories
    });
  } catch (err) {
    console.error('getFeatured error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving featured courses.' });
  }
};
