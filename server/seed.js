const bcrypt = require('bcryptjs');
const db = require('./models/db');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data to ensure clean fresh state
  db.Users.deleteMany({});
  db.Courses.deleteMany({});
  db.Enrollments.deleteMany({});
  db.Quizzes.deleteMany({});
  db.Reviews.deleteMany({});
  db.Certificates.deleteMany({});
  db.Discussions.deleteMany({});
  db.LiveClasses.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const studentPassword = await bcrypt.hash('student123', salt);
  const instructorPassword = await bcrypt.hash('instructor123', salt);
  const adminPassword = await bcrypt.hash('admin123', salt);

  // 1. Seed Users
  const student = db.Users.create({
    _id: 'user-student-1',
    name: 'Alex Johnson',
    email: 'student@learnhub.com',
    password: studentPassword,
    role: 'student',
    headline: 'Aspiring Full-Stack Software Engineer',
    bio: 'Passionate about React, modern JavaScript, and building accessible web applications.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    points: 380,
    badges: ['New Explorer', 'Quiz Ace', 'Fast Learner']
  });

  const instructor = db.Users.create({
    _id: 'user-instructor-1',
    name: 'Dr. Sarah Mitchell',
    email: 'instructor@learnhub.com',
    password: instructorPassword,
    role: 'instructor',
    headline: 'Senior Principal Engineer & Author',
    bio: '12+ years of engineering experience at Google and Microsoft. Trained over 150,000 developers worldwide.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    points: 1250,
    badges: ['Top Instructor', 'Mentor of the Year']
  });

  const admin = db.Users.create({
    _id: 'user-admin-1',
    name: 'Marcus Vance',
    email: 'admin@learnhub.com',
    password: adminPassword,
    role: 'admin',
    headline: 'Platform Operations Lead',
    bio: 'Overseeing global platform infrastructure and content excellence.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    points: 9999,
    badges: ['Platform Admin']
  });

  console.log('✅ Users seeded: student@learnhub.com, instructor@learnhub.com, admin@learnhub.com');

  // Video links: High quality publicly accessible demo MP4s (Google Storage / BigBuckBunny / Tears of Steel / Blender)
  const video1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const video2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
  const video3 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const video4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

  // 2. Seed Courses
  const course1 = db.Courses.create({
    _id: 'course-fullstack-1',
    title: 'Full-Stack Web Development Mastery (React, Node.js & MongoDB)',
    subtitle: 'From zero to building and deploying scalable production SaaS applications with authentication, REST APIs, and state management.',
    description: 'Master modern full-stack web engineering from the ground up. In this comprehensive flagship course, you will learn React 19, modern JavaScript ESNext, Node.js, Express.js RESTful API design, database modeling, JWT authentication, video streaming, and production cloud deployment. Packed with hands-on labs, downloadable architecture templates, and realistic real-world projects.',
    category: 'Development',
    difficulty: 'Intermediate',
    price: 49.99,
    rating: 4.9,
    ratingCount: 1240,
    enrolledCount: 5420,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    instructorId: instructor._id,
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar,
    tags: ['React', 'Node.js', 'Express', 'JavaScript', 'Fullstack', 'Web Dev'],
    requirements: [
      'Basic understanding of HTML, CSS, and elementary JavaScript',
      'A computer with Node.js installed and an open mind to build projects'
    ],
    learningOutcomes: [
      'Architect robust RESTful APIs with Express and Node.js',
      'Build responsive, reactive user interfaces with modern React',
      'Implement bulletproof JWT authentication and role-based security',
      'Handle file uploads, database queries, and video streaming',
      'Deploy full-stack applications with production best practices'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Foundations of Full-Stack Architecture',
        lessons: [
          {
            id: 'les-1-1',
            title: 'Welcome & Course Roadmap Overview',
            duration: 340,
            videoUrl: video1,
            preview: true,
            description: 'Get an overview of the curriculum, technology stack choices, and how the learning platform works.',
            resources: [
              { name: 'Course Syllabus PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
              { name: 'GitHub Starter Template', url: 'https://github.com' }
            ]
          },
          {
            id: 'les-1-2',
            title: 'Modern JavaScript & React 19 State Mental Model',
            duration: 520,
            videoUrl: video2,
            preview: true,
            description: 'Deep dive into component lifecycles, custom hooks, and immutability for performant UI rendering.',
            resources: [
              { name: 'State Management Cheatsheet', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
            ]
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Backend APIs, Express & JWT Security',
        lessons: [
          {
            id: 'les-2-1',
            title: 'Designing Clean RESTful Endpoints with Express',
            duration: 610,
            videoUrl: video3,
            preview: false,
            description: 'Learn the architectural principles of HTTP methods, status codes, controller modularization, and error handling.',
            resources: [
              { name: 'REST API Best Practices Guide', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
            ]
          },
          {
            id: 'les-2-2',
            title: 'Authentication Deep Dive: Passwords, Bcrypt & JWT Tokens',
            duration: 480,
            videoUrl: video4,
            preview: false,
            description: 'Step-by-step implementation of password hashing with bcrypt and signed JWT bearer tokens for secure sessions.',
            resources: [
              { name: 'JWT Security Checklist', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
            ]
          }
        ]
      }
    ]
  });

  const course2 = db.Courses.create({
    _id: 'course-ai-python-2',
    title: 'Python for AI, Machine Learning & Deep Neural Networks',
    subtitle: 'Learn data analysis with NumPy & Pandas, build predictive machine learning models with Scikit-Learn, and train neural networks with PyTorch.',
    description: 'Artificial intelligence is reshaping every industry. This hands-on masterclass equips you with the statistical intuition, mathematics, and Python programming skills required to build, evaluate, and deploy state-of-the-art machine learning models.',
    category: 'Data Science',
    difficulty: 'All Levels',
    price: 39.99,
    rating: 4.8,
    ratingCount: 890,
    enrolledCount: 3820,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80',
    instructorId: instructor._id,
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar,
    tags: ['Python', 'AI', 'Machine Learning', 'Data Science', 'PyTorch'],
    requirements: ['No prior machine learning experience required', 'Basic mathematics familiarity'],
    learningOutcomes: [
      'Master NumPy, Pandas, and Matplotlib data pipelines',
      'Train supervised and unsupervised machine learning algorithms',
      'Build convolutional and deep neural networks in PyTorch',
      'Evaluate models using precision, recall, ROC-AUC, and cross-validation'
    ],
    modules: [
      {
        id: 'mod-ai-1',
        title: 'Module 1: Python Data Science Ecosystem',
        lessons: [
          {
            id: 'les-ai-1-1',
            title: 'Vectorized Computing with NumPy Arrays',
            duration: 420,
            videoUrl: video1,
            preview: true,
            description: 'Understand array broadcasting, matrix multiplications, and high-speed numerical computations.',
            resources: [{ name: 'NumPy Cheat Sheet', url: '#' }]
          },
          {
            id: 'les-ai-1-2',
            title: 'Data Wrangling and Cleaning with Pandas',
            duration: 540,
            videoUrl: video3,
            preview: false,
            description: 'Handle missing values, aggregate grouping, and transform messy real-world datasets.',
            resources: [{ name: 'Sample Datasets CSV', url: '#' }]
          }
        ]
      }
    ]
  });

  const course3 = db.Courses.create({
    _id: 'course-uiux-3',
    title: 'Modern UI/UX Design Systems: Figma to Interactive Prototypes',
    subtitle: 'Craft jaw-dropping user interfaces, master component design tokens, auto-layout, micro-animations, and UX research.',
    description: 'Transform your design workflow. Learn how industry leaders build scalable design systems in Figma with auto-layout, variant states, interactive micro-animations, accessible color contrast tokens, and design-to-code handoffs.',
    category: 'Design',
    difficulty: 'Beginner',
    price: 0.00, // FREE course!
    rating: 4.9,
    ratingCount: 2100,
    enrolledCount: 8900,
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    instructorId: instructor._id,
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar,
    tags: ['UI/UX', 'Figma', 'Design Systems', 'Web Design', 'Prototyping'],
    requirements: ['Figma free account', 'Passion for beautiful visual design'],
    learningOutcomes: [
      'Master Figma Auto Layout 5.0 and component variants',
      'Build scalable multi-brand design tokens for light and dark modes',
      'Design accessible, high-converting checkout and SaaS landing pages',
      'Conduct practical usability testing and wireframing'
    ],
    modules: [
      {
        id: 'mod-des-1',
        title: 'Module 1: Figma Fundamentals & Auto Layout',
        lessons: [
          {
            id: 'les-des-1-1',
            title: 'Figma Canvas & Auto Layout Mastery',
            duration: 380,
            videoUrl: video2,
            preview: true,
            description: 'Create responsive UI components that seamlessly adapt to mobile, tablet, and widescreen layouts.',
            resources: [{ name: 'Figma Exercise File (.fig)', url: '#' }]
          }
        ]
      }
    ]
  });

  const course4 = db.Courses.create({
    _id: 'course-devops-4',
    title: 'DevOps & Cloud Engineering: Docker, Kubernetes & CI/CD Pipelines',
    subtitle: 'Containerize microservices, automate build pipelines with GitHub Actions, orchestrate pods in Kubernetes, and deploy to AWS.',
    description: 'Learn modern DevOps practices from scratch. Containerize backend APIs with Docker, write multi-stage Dockerfiles, deploy Kubernetes clusters, configure Ingress routing, set up automated CI/CD pipelines, and monitor uptime.',
    category: 'DevOps',
    difficulty: 'Advanced',
    price: 54.99,
    rating: 4.7,
    ratingCount: 430,
    enrolledCount: 1980,
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    instructorId: instructor._id,
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar,
    tags: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Cloud'],
    requirements: ['Command-line basics', 'Basic Linux and Web development familiarity'],
    learningOutcomes: [
      'Build lightweight multi-stage Docker containers',
      'Deploy and scale resilient Kubernetes deployments and services',
      'Create automated test and deploy GitHub Actions workflows',
      'Manage cloud infrastructure with modern GitOps standards'
    ],
    modules: [
      {
        id: 'mod-devops-1',
        title: 'Module 1: Docker Containers from Scratch',
        lessons: [
          {
            id: 'les-d-1-1',
            title: 'Containerization Concepts & Docker CLI',
            duration: 490,
            videoUrl: video4,
            preview: true,
            description: 'Why containers revolutionized software shipping and how to build your first custom Docker image.',
            resources: [{ name: 'Dockerfile Cheat Sheet', url: '#' }]
          }
        ]
      }
    ]
  });

  console.log('✅ Courses seeded: 4 courses across Development, Data Science, Design, DevOps');

  // 3. Seed Comprehensive Quizzes
  // Quiz for Course 1 (Multiple Choice, True/False, and Fill in the Blanks!)
  db.Quizzes.create({
    _id: 'quiz-fullstack-1',
    courseId: course1._id,
    title: 'Full-Stack Web Development Certification Quiz',
    description: 'Demonstrate your understanding of React state mechanics, Express middleware, and JWT security to earn your badge.',
    passingScore: 70,
    timeLimitMinutes: 15,
    questions: [
      {
        id: 'q-1',
        questionText: 'Which React hook is primarily used for managing local state inside a functional component?',
        type: 'multiple_choice',
        options: ['useEffect', 'useState', 'useContext', 'useMemo'],
        correctAnswer: 'useState',
        explanation: 'useState declares a state variable that preserves values across re-renders.'
      },
      {
        id: 'q-2',
        questionText: 'In Express.js, middleware functions have access to the request object (req), response object (res), and the next middleware function (next).',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'True! Middleware functions can execute code, make changes to req/res, and call next() to pass control.'
      },
      {
        id: 'q-3',
        questionText: 'What HTTP status code is universally used to indicate a successful resource creation?',
        type: 'multiple_choice',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctAnswer: '201 Created',
        explanation: 'HTTP 201 Created signifies that the request succeeded and resulted in the creation of a new resource.'
      },
      {
        id: 'q-4',
        questionText: 'JSON Web Tokens (JWT) consist of three parts separated by dots: header, payload, and ________.',
        type: 'fill_in_blank',
        options: [],
        correctAnswer: 'signature',
        explanation: 'A JWT consists of Header.Payload.Signature encoded in Base64Url.'
      },
      {
        id: 'q-5',
        questionText: 'Bcrypt uses salt rounds to protect stored passwords against rainbow table attacks and brute force cracking.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Bcrypt automatically generates a unique random cryptographic salt for each password hash.'
      }
    ]
  });

  // Quiz for Course 3
  db.Quizzes.create({
    _id: 'quiz-uiux-3',
    courseId: course3._id,
    title: 'UI/UX Design Systems Mastery Quiz',
    description: 'Verify your design system architecture and Figma Auto Layout competency.',
    passingScore: 70,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'qu-1',
        questionText: 'In Figma, what feature dynamically adjusts component padding and direction when child layers change?',
        type: 'multiple_choice',
        options: ['Smart Animate', 'Auto Layout', 'Boolean Operation', 'Layer Mask'],
        correctAnswer: 'Auto Layout',
        explanation: 'Auto Layout allows buttons, lists, and cards to dynamically stretch and wrap based on their content.'
      },
      {
        id: 'qu-2',
        questionText: 'WCAG AAA requires a minimum color contrast ratio of 7:1 for normal body text.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'True! WCAG 2.1 AAA level requires 7:1 contrast for normal text and 4.5:1 for large text.'
      }
    ]
  });

  console.log('✅ Quizzes seeded: Full-Stack Quiz & UI/UX Quiz');

  // 4. Seed Reviews
  db.Reviews.create({
    _id: 'rev-1',
    courseId: course1._id,
    userId: 'user-ext-1',
    userName: 'Samantha Lee',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Hands down the best full-stack course on the web! The explanations on JWT auth and video streaming were crystal clear.',
    likes: 34
  });

  db.Reviews.create({
    _id: 'rev-2',
    courseId: course1._id,
    userId: 'user-ext-2',
    userName: 'David Miller',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'The project structure mirrors exactly what my team uses in production. The downloadable certificate verified immediately on my resume!',
    likes: 19
  });

  db.Reviews.create({
    _id: 'rev-3',
    courseId: course3._id,
    userId: 'user-ext-3',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Incredible that this course is free. The Auto Layout tricks alone saved me hours every week in Figma.',
    likes: 42
  });

  // 5. Seed Discussions
  db.Discussions.create({
    _id: 'disc-1',
    courseId: course1._id,
    lessonId: 'les-1-2',
    lessonTitle: 'Modern JavaScript & React 19 State Mental Model',
    userId: student._id,
    userName: student.name,
    userAvatar: student.avatar,
    userRole: 'student',
    title: 'When should we prefer useReducer over useState for complex forms?',
    message: 'I am building a multi-step checkout form with several interdependent fields. Is useReducer recommended here over multiple useState hooks?',
    likes: 8,
    likedBy: [],
    replies: [
      {
        id: 'rep-1',
        userId: instructor._id,
        userName: instructor.name,
        userAvatar: instructor.avatar,
        userRole: 'instructor',
        message: 'Great question Alex! Yes, when next state depends on previous state across multiple properties, useReducer provides a clean centralized state transition pattern and avoids race conditions.',
        createdAt: new Date().toISOString()
      }
    ]
  });

  // 6. Seed Live Classes & Webinars
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  db.LiveClasses.create({
    _id: 'live-1',
    title: 'Live Workshop: Building Real-Time Full-Stack Apps with WebSockets & React',
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar,
    instructorHeadline: instructor.headline,
    scheduledAt: tomorrow.toISOString(),
    durationMinutes: 90,
    description: 'Join Dr. Sarah Mitchell for an interactive coding session building a real-time collaborative whiteboard and chat room live on stream.',
    category: 'Development',
    level: 'Intermediate',
    registeredCount: 340,
    registeredUsers: [student._id],
    streamUrl: 'https://youtube.com',
    status: 'upcoming'
  });

  db.LiveClasses.create({
    _id: 'live-2',
    title: 'System Design Q&A: Preparing for Senior Engineering Interviews',
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar,
    instructorHeadline: instructor.headline,
    scheduledAt: nextWeek.toISOString(),
    durationMinutes: 60,
    description: 'Ask anything about distributed caching, rate limiters, message queues, and how to ace system design interviews.',
    category: 'Career & Architecture',
    level: 'Advanced',
    registeredCount: 520,
    registeredUsers: [],
    streamUrl: 'https://youtube.com',
    status: 'upcoming'
  });

  // 7. Seed Active Enrollment for the Demo Student
  // We enroll the demo student in Course 1 with 2 lessons completed so they can test both in-progress and completion!
  db.Enrollments.create({
    _id: 'enr-alex-course1',
    userId: student._id,
    courseId: course1._id,
    courseTitle: course1.title,
    courseThumbnail: course1.thumbnail,
    enrolledAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lastAccessedAt: new Date().toISOString(),
    progress: 50, // 2 out of 4 lessons completed
    completedLessons: ['les-1-1', 'les-1-2'],
    currentLessonId: 'les-2-1',
    lessonProgress: {
      'les-1-1': { lastWatchedTime: 340, duration: 340, completed: true },
      'les-1-2': { lastWatchedTime: 520, duration: 520, completed: true },
      'les-2-1': { lastWatchedTime: 120, duration: 610, completed: false }
    },
    quizScores: {},
    isCompleted: false,
    completedAt: null,
    certificateId: null,
    payment: {
      amount: 49.99,
      currency: 'USD',
      status: 'completed',
      transactionId: 'TXN-INIT-DEMO-01',
      method: 'credit_card'
    }
  });

  // Also enroll the demo student in Course 3 with 100% completion so they can IMMEDIATELY view and test certificate generation!
  const certId = 'LMS-CERT-A89F2C10';
  db.Enrollments.create({
    _id: 'enr-alex-course3',
    userId: student._id,
    courseId: course3._id,
    courseTitle: course3.title,
    courseThumbnail: course3.thumbnail,
    enrolledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    lastAccessedAt: new Date().toISOString(),
    progress: 100, // 100% completed!
    completedLessons: ['les-des-1-1'],
    currentLessonId: 'les-des-1-1',
    lessonProgress: {
      'les-des-1-1': { lastWatchedTime: 380, duration: 380, completed: true }
    },
    quizScores: {
      'quiz-uiux-3': {
        score: 100,
        passed: true,
        correctCount: 2,
        totalQuestions: 2,
        attemptedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    },
    isCompleted: true,
    completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    certificateId: certId,
    payment: {
      amount: 0,
      currency: 'USD',
      status: 'completed',
      transactionId: 'TXN-FREE-01',
      method: 'free_enroll'
    }
  });

  // Generate the certificate record for Course 3
  db.Certificates.create({
    certificateId: certId,
    userId: student._id,
    userName: student.name,
    userEmail: student.email,
    courseId: course3._id,
    courseTitle: course3.title,
    instructorName: course3.instructorName,
    category: course3.category,
    issueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    grade: 'Excellence (100%)',
    verifyUrl: `/verify-certificate/${certId}`
  });

  console.log('✅ Enrollment & Certificate demo seeded for student Alex Johnson!');
  console.log('🎉 Seeding successfully completed!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
