const db = require('../models/db');

// @desc    Get upcoming live classes and workshops
// @route   GET /api/live-classes
// @access  Public
exports.getLiveClasses = async (req, res) => {
  try {
    const liveClasses = db.LiveClasses.find();
    liveClasses.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    res.status(200).json({
      success: true,
      count: liveClasses.length,
      liveClasses
    });
  } catch (err) {
    console.error('getLiveClasses error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving live classes.' });
  }
};

// @desc    Register for a live session
// @route   POST /api/live-classes/:id/register
// @access  Private
exports.registerLiveClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user._id;

    const liveClass = db.LiveClasses.findById(classId);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found.' });
    }

    const registeredUsers = liveClass.registeredUsers || [];
    if (!registeredUsers.includes(userId)) {
      registeredUsers.push(userId);
      db.LiveClasses.findByIdAndUpdate(classId, {
        registeredUsers,
        registeredCount: registeredUsers.length
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully registered for this live session!',
      registeredCount: registeredUsers.length
    });
  } catch (err) {
    console.error('registerLiveClass error:', err);
    res.status(500).json({ success: false, message: 'Server error registering for live class.' });
  }
};
