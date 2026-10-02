const express = require('express');
const router = express.Router();
const { getLiveClasses, registerLiveClass } = require('../controllers/liveClassController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getLiveClasses);
router.post('/:id/register', protect, registerLiveClass);

module.exports = router;
