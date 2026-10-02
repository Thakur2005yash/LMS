const express = require('express');
const router = express.Router();
const {
  getDiscussions,
  createDiscussion,
  replyDiscussion,
  likeDiscussion
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId', getDiscussions);
router.post('/:courseId', protect, createDiscussion);
router.post('/:id/reply', protect, replyDiscussion);
router.post('/:id/like', protect, likeDiscussion);

module.exports = router;
