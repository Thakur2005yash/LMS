const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_lms_platform_2026_secure';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', bio = '', avatar = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = db.Users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default avatar if not provided
    const userAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const newUser = db.Users.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: ['student', 'instructor', 'admin'].includes(role) ? role : 'student',
      bio: bio.trim(),
      avatar: userAvatar,
      headline: role === 'instructor' ? 'Course Instructor & Educator' : 'Curious Learner',
      enrolledCourses: [],
      createdCourses: [],
      points: 100, // Welcome bonus points!
      badges: ['New Explorer']
    });

    const token = generateToken(newUser._id);
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.Users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(user._id);
    const { password: _, ...userSafe } = user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = db.Users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const enrollments = db.Enrollments.find({ userId: user._id });
    const certificates = db.Certificates.find({ userId: user._id });

    const { password: _, ...userSafe } = user;

    res.status(200).json({
      success: true,
      user: {
        ...userSafe,
        totalEnrolled: enrollments.length,
        totalCertificates: certificates.length
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, headline, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (headline !== undefined) updates.headline = headline.trim();
    if (avatar) updates.avatar = avatar;

    const updatedUser = db.Users.findByIdAndUpdate(req.user._id, updates, { new: true });
    const { password: _, ...userSafe } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userSafe
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.'
      });
    }

    const user = db.Users.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.Users.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
};
