const db = require('../models/db');

// Helper to recalculate course rating
const updateCourseRatingMetrics = (courseId) => {
  const reviews = db.Reviews.find({ courseId });
  if (reviews.length === 0) {
    db.Courses.findByIdAndUpdate(courseId, { rating: 5.0, ratingCount: 0 });
    return;
  }
  const totalStars = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
  const avg = parseFloat((totalStars / reviews.length).toFixed(1));
  db.Courses.findByIdAndUpdate(courseId, { rating: avg, ratingCount: reviews.length });
};

// @desc    Get all reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = db.Reviews.find({ courseId });

    // Sort newest first
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Distribution breakdown
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      distribution,
      reviews
    });
  } catch (err) {
    console.error('getCourseReviews error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving reviews.' });
  }
};

// @desc    Add review for an enrolled course
// @route   POST /api/reviews/:courseId
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and review comment.' });
    }

    const course = db.Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if user already reviewed
    const existing = db.Reviews.findOne({ courseId, userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course. You can update your existing review.'
      });
    }

    const newReview = db.Reviews.create({
      courseId,
      userId,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      comment: comment.trim(),
      likes: 0
    });

    // Recalculate course rating
    updateCourseRatingMetrics(courseId);

    // Reward points for reviewing
    const user = db.Users.findById(userId);
    const points = (user.points || 0) + 20;
    db.Users.findByIdAndUpdate(userId, { points });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review: newReview
    });
  } catch (err) {
    console.error('addReview error:', err);
    res.status(500).json({ success: false, message: 'Server error adding review.' });
  }
};

// @desc    Update user's review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = db.Reviews.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review.' });
    }

    const updates = {};
    if (rating) updates.rating = Math.min(5, Math.max(1, parseInt(rating, 10)));
    if (comment) updates.comment = comment.trim();

    const updated = db.Reviews.findByIdAndUpdate(reviewId, updates, { new: true });
    updateCourseRatingMetrics(review.courseId);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review: updated
    });
  } catch (err) {
    console.error('updateReview error:', err);
    res.status(500).json({ success: false, message: 'Server error updating review.' });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = db.Reviews.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }

    const courseId = review.courseId;
    db.Reviews.findByIdAndDelete(reviewId);
    updateCourseRatingMetrics(courseId);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully.'
    });
  } catch (err) {
    console.error('deleteReview error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting review.' });
  }
};
