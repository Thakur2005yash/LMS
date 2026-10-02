const db = require('../models/db');

// @desc    Intelligent AI Tutor for course students
// @route   POST /api/ai-tutor/chat
// @access  Private
exports.chatWithAiTutor = async (req, res) => {
  try {
    const { message, courseId, lessonTitle, codeSnippet } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    let course = null;
    if (courseId) {
      course = db.Courses.findById(courseId);
    }

    const courseContext = course ? `Course: "${course.title}" (${course.category}, ${course.difficulty})` : 'General Web & Software Engineering';
    const lessonContext = lessonTitle ? `Current Lesson: "${lessonTitle}"` : '';

    // Generate context-aware intelligent educational response
    const query = message.toLowerCase();
    let reply = '';
    let suggestions = [];

    if (query.includes('explain') || query.includes('what is') || query.includes('how does')) {
      reply = `🎓 **AI Tutor Concept Breakdown**:\n\nIn the context of ${lessonContext || courseContext}, here is how to understand this clearly:\n\n1. **Core Concept**: Every technology you are learning connects foundational syntax to real-world software architecture.\n2. **Mental Model**: Think of this component as a contract — it takes predictable inputs, processes state, and produces reliable side-effects.\n3. **Best Practice**: Always decouple business logic from presentation, handle edge cases (like null/undefined), and test your assumptions in isolation.\n\nWould you like a runnable code snippet or a step-by-step example on this?`;
      suggestions = ['Show me a code example', 'How do I test this?', 'Explain common pitfalls'];
    } else if (query.includes('error') || query.includes('bug') || query.includes('fail') || query.includes('fix')) {
      reply = `🔍 **AI Debugging Assistant**:\n\nLet's diagnose this issue together!\n\n1. **Verify State & Props**: Ensure variables are defined before accessing properties (use optional chaining \`?.\`).\n2. **Check Asynchronous Flows**: When dealing with Promises or async/await, verify that errors are caught inside \`try...catch\` blocks.\n3. **Network & Payload**: Verify in DevTools Network tab that the response matches the expected JSON schema.\n\nShare the exact terminal error or console trace, and I will write the fix for you!`;
      suggestions = ['How to inspect network requests?', 'Common React re-render bugs', 'Show async error handler pattern'];
    } else if (query.includes('quiz') || query.includes('hint') || query.includes('test')) {
      reply = `💡 **Quiz Prep Hint**:\n\nFor the upcoming quiz in ${course ? course.title : 'this course'}:\n- Focus on key definitions and lifecycle methods.\n- Understand the difference between client-side state and persistent server database records.\n- Review how JWT authorization tokens protect sensitive API endpoints.\n\nTake your time on the quiz — you can always review the feedback after submitting!`;
      suggestions = ['Review module summary', 'Take practice quiz', 'Explain JWT mechanics'];
    } else if (query.includes('summary') || query.includes('recap')) {
      reply = `📋 **Lesson Summary & Key Takeaways**:\n\nHere is a quick refresher of what matters most in ${lessonTitle || 'this session'}:\n- ✅ **Key Terminology**: Clean architecture, RESTful conventions, and reactive state.\n- ⚙️ **Key Workflow**: Read requirements → Design data structures → Implement handlers → Verify in browser.\n- 🚀 **Next Steps**: Complete the quiz and proceed to the next hands-on coding lab!`;
      suggestions = ['Next lesson roadmap', 'Download cheatsheet', 'Ask another question'];
    } else {
      reply = `👋 Hello ${req.user.name}! I am your dedicated AI Learning Tutor for ${course ? course.title : 'LearnHub'}.\n\nI can help you with:\n- Explaining complex coding concepts\n- Debugging errors and explaining terminal output\n- Code reviews and best practices\n- Quizzes and interview preparation\n\nWhat would you like to master today?`;
      suggestions = ['Explain current lesson', 'Give me a practice challenge', 'Review course roadmap'];
    }

    res.status(200).json({
      success: true,
      reply,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('chatWithAiTutor error:', err);
    res.status(500).json({ success: false, message: 'Server error generating AI tutor response.' });
  }
};
