const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./models/db');
const seedDatabase = require('./seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const aiTutorRoutes = require('./routes/aiTutorRoutes');
const liveClassRoutes = require('./routes/liveClassRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: '*', // Allow frontend client connections
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'LearnHub Online Learning Platform (LMS) - Advanced',
    timestamp: new Date().toISOString(),
    database: 'Embedded JSON Document Store (Ready & Persistent)'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Auto-seed if database is empty on initial run
const initApp = async () => {
  try {
    if (db.Courses.count() === 0 || db.Users.count() === 0) {
      console.log('⚡ Initializing database with rich starter data...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Initial auto-seed error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 LearnHub LMS Backend API running at http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
};

initApp();

module.exports = app;
