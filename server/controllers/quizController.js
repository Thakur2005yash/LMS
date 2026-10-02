const db = require('../models/db');

// @desc    Get quiz by course ID
// @route   GET /api/quizzes/:courseId
// @access  Public (Sanitizes correct answers for non-evaluated requests)
exports.getQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    let quiz = db.Quizzes.findOne({ courseId });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz found for this course.' });
    }

    // Check if user is instructor/admin
    const isInstructor = req.user && (req.user.role === 'instructor' || req.user.role === 'admin');

    // If not instructor, don't expose correct answers in the frontend state beforehand!
    const sanitizedQuestions = quiz.questions.map((q, idx) => {
      const { correctAnswer, explanation, ...clientSafe } = q;
      return {
        ...clientSafe,
        id: q.id || `q-${idx + 1}`
      };
    });

    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        courseId: quiz.courseId,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore || 70,
        timeLimitMinutes: quiz.timeLimitMinutes || 15,
        totalQuestions: quiz.questions.length,
        questions: isInstructor ? quiz.questions : sanitizedQuestions
      }
    });
  } catch (err) {
    console.error('getQuiz error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving quiz.' });
  }
};

// @desc    Submit quiz answers and get instant auto-graded score
// @route   POST /api/quizzes/:courseId/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // Map or array: { [questionId]: answerValue }
    const userId = req.user._id;

    const quiz = db.Quizzes.findOne({ courseId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Submitted answers are required.' });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const feedback = [];

    quiz.questions.forEach((q, idx) => {
      const qId = q.id || `q-${idx + 1}`;
      const studentAnswer = answers[qId];
      let isCorrect = false;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        isCorrect = String(studentAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      } else if (q.type === 'fill_in_blank') {
        const acceptable = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        isCorrect = acceptable.some(
          ans => String(studentAnswer || '').trim().toLowerCase() === String(ans).trim().toLowerCase()
        );
      }

      if (isCorrect) {
        correctCount += 1;
      }

      feedback.push({
        questionId: qId,
        questionText: q.questionText,
        type: q.type,
        studentAnswer: studentAnswer || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || 'Review the lesson material on this topic.'
      });
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= (quiz.passingScore || 70);

    // Save quiz attempt in enrollment
    const enrollment = db.Enrollments.findOne({ courseId, userId });
    if (enrollment) {
      const quizScores = enrollment.quizScores || {};
      quizScores[quiz._id] = {
        score: scorePercentage,
        passed,
        correctCount,
        totalQuestions,
        attemptedAt: new Date().toISOString()
      };

      db.Enrollments.findByIdAndUpdate(enrollment._id, { quizScores });
    }

    // Award bonus points for passing quiz
    if (passed) {
      const user = db.Users.findById(userId);
      const points = (user.points || 0) + 50;
      const badges = user.badges || [];
      if (!badges.includes('Quiz Ace')) badges.push('Quiz Ace');
      db.Users.findByIdAndUpdate(userId, { points, badges });
    }

    res.status(200).json({
      success: true,
      result: {
        score: scorePercentage,
        passed,
        correctCount,
        totalQuestions,
        passingScore: quiz.passingScore || 70,
        feedback
      }
    });
  } catch (err) {
    console.error('submitQuiz error:', err);
    res.status(500).json({ success: false, message: 'Server error submitting quiz.' });
  }
};

// @desc    Create or update quiz for a course
// @route   POST /api/quizzes
// @access  Private (Instructor or Admin)
exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, passingScore = 70, timeLimitMinutes = 15, questions } = req.body;

    if (!courseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'courseId and questions array are required.'
      });
    }

    const course = db.Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course.instructorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create quiz for this course.' });
    }

    // Assign IDs to questions if not provided
    const formattedQuestions = questions.map((q, idx) => ({
      id: q.id || `q-${idx + 1}`,
      questionText: q.questionText,
      type: q.type || 'multiple_choice', // multiple_choice, true_false, fill_in_blank
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    }));

    let quiz = db.Quizzes.findOne({ courseId });

    if (quiz) {
      quiz = db.Quizzes.findByIdAndUpdate(quiz._id, {
        title: title || quiz.title,
        description: description || quiz.description,
        passingScore,
        timeLimitMinutes,
        questions: formattedQuestions
      }, { new: true });
    } else {
      quiz = db.Quizzes.create({
        courseId,
        title: title || `${course.title} Comprehensive Quiz`,
        description: description || 'Test your knowledge and prove your mastery.',
        passingScore,
        timeLimitMinutes,
        questions: formattedQuestions
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quiz saved successfully.',
      quiz
    });
  } catch (err) {
    console.error('createQuiz error:', err);
    res.status(500).json({ success: false, message: 'Server error creating quiz.' });
  }
};
