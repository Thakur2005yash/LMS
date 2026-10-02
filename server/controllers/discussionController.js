const db = require('../models/db');

// @desc    Get discussions for course or specific lesson
// @route   GET /api/discussions/:courseId
// @access  Public
exports.getDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.query;

    let filter = { courseId };
    if (lessonId) {
      filter.lessonId = lessonId;
    }

    const threads = db.Discussions.find(filter);
    threads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: threads.length,
      discussions: threads
    });
  } catch (err) {
    console.error('getDiscussions error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving discussions.' });
  }
};

// @desc    Post a new question/thread in course discussion
// @route   POST /api/discussions/:courseId
// @access  Private
exports.createDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, message, lessonId, lessonTitle } = req.body;
    const userId = req.user._id;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const thread = db.Discussions.create({
      courseId,
      lessonId: lessonId || null,
      lessonTitle: lessonTitle || null,
      userId,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      userRole: req.user.role,
      title: title.trim(),
      message: message.trim(),
      likes: 0,
      likedBy: [],
      replies: []
    });

    res.status(201).json({
      success: true,
      message: 'Discussion question posted.',
      discussion: thread
    });
  } catch (err) {
    console.error('createDiscussion error:', err);
    res.status(500).json({ success: false, message: 'Server error creating discussion.' });
  }
};

// @desc    Reply to a discussion thread
// @route   POST /api/discussions/:id/reply
// @access  Private
exports.replyDiscussion = async (req, res) => {
  try {
    const threadId = req.params.id;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }

    const thread = db.Discussions.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found.' });
    }

    const reply = {
      id: 'rep-' + Date.now(),
      userId,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      userRole: req.user.role,
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    const replies = thread.replies || [];
    replies.push(reply);

    const updated = db.Discussions.findByIdAndUpdate(threadId, { replies }, { new: true });

    res.status(201).json({
      success: true,
      message: 'Reply added successfully.',
      discussion: updated
    });
  } catch (err) {
    console.error('replyDiscussion error:', err);
    res.status(500).json({ success: false, message: 'Server error replying to discussion.' });
  }
};

// @desc    Upvote / like discussion thread
// @route   POST /api/discussions/:id/like
// @access  Private
exports.likeDiscussion = async (req, res) => {
  try {
    const threadId = req.params.id;
    const userId = req.user._id;

    const thread = db.Discussions.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found.' });
    }

    let likedBy = thread.likedBy || [];
    let likes = thread.likes || 0;

    if (likedBy.includes(userId)) {
      likedBy = likedBy.filter(id => id !== userId);
      likes = Math.max(0, likes - 1);
    } else {
      likedBy.push(userId);
      likes += 1;
    }

    const updated = db.Discussions.findByIdAndUpdate(threadId, { likes, likedBy }, { new: true });

    res.status(200).json({
      success: true,
      likes: updated.likes,
      hasLiked: updated.likedBy.includes(userId)
    });
  } catch (err) {
    console.error('likeDiscussion error:', err);
    res.status(500).json({ success: false, message: 'Server error liking discussion.' });
  }
};
