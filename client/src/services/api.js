// Centralized API client for LearnHub LMS Platform

const API_BASE = '/api';

const getToken = () => localStorage.getItem('lms_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () =>
    request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  changePassword: (passwords) =>
    request('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) }),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/courses${query ? `?${query}` : ''}`);
  },
  getFeaturedCourses: () =>
    request('/courses/featured'),
  getCourseById: (id) =>
    request(`/courses/${id}`),
  createCourse: (courseData) =>
    request('/courses', { method: 'POST', body: JSON.stringify(courseData) }),
  updateCourse: (id, courseData) =>
    request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(courseData) }),
  deleteCourse: (id) =>
    request(`/courses/${id}`, { method: 'DELETE' }),

  // Lessons
  getLesson: (courseId, lessonId) =>
    request(`/courses/${courseId}/lessons/${lessonId}`),

  // Enrollments
  enrollCourse: (courseId, paymentMethod = 'credit_card') =>
    request('/enrollments', { method: 'POST', body: JSON.stringify({ courseId, paymentMethod }) }),
  getMyEnrollments: () =>
    request('/enrollments/my'),

  // Progress
  getProgress: (courseId) =>
    request(`/progress/${courseId}`),
  updateVideoProgress: (courseId, progressData) =>
    request(`/progress/${courseId}/video`, { method: 'POST', body: JSON.stringify(progressData) }),
  toggleLessonCompletion: (courseId, lessonId) =>
    request(`/progress/${courseId}/toggle-lesson`, { method: 'POST', body: JSON.stringify({ lessonId }) }),

  // Quizzes
  getQuiz: (courseId) =>
    request(`/quizzes/${courseId}`),
  submitQuiz: (courseId, answers) =>
    request(`/quizzes/${courseId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  createQuiz: (quizData) =>
    request('/quizzes', { method: 'POST', body: JSON.stringify(quizData) }),

  // Certificates
  getCertificate: (courseId) =>
    request(`/certificates/${courseId}`),
  verifyCertificate: (certId) =>
    request(`/certificates/verify/${certId}`),
  downloadCertificateUrl: (courseId) =>
    `${API_BASE}/certificates/${courseId}/download`,

  // Reviews
  getReviews: (courseId) =>
    request(`/reviews/${courseId}`),
  addReview: (courseId, reviewData) =>
    request(`/reviews/${courseId}`, { method: 'POST', body: JSON.stringify(reviewData) }),
  updateReview: (reviewId, reviewData) =>
    request(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(reviewData) }),
  deleteReview: (reviewId) =>
    request(`/reviews/${reviewId}`, { method: 'DELETE' }),

  // Instructor
  getInstructorStats: () =>
    request('/instructor/stats'),
  getInstructorCourses: () =>
    request('/instructor/courses'),
  getCourseStudents: (courseId) =>
    request(`/instructor/courses/${courseId}/students`),

  // Discussions
  getDiscussions: (courseId, lessonId = null) => {
    const q = lessonId ? `?lessonId=${lessonId}` : '';
    return request(`/discussions/${courseId}${q}`);
  },
  createDiscussion: (courseId, data) =>
    request(`/discussions/${courseId}`, { method: 'POST', body: JSON.stringify(data) }),
  replyDiscussion: (threadId, message) =>
    request(`/discussions/${threadId}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
  likeDiscussion: (threadId) =>
    request(`/discussions/${threadId}/like`, { method: 'POST' }),

  // AI Learning Assistant
  chatWithAiTutor: (data) =>
    request('/ai-tutor/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Live Classes
  getLiveClasses: () =>
    request('/live-classes'),
  registerLiveClass: (id) =>
    request(`/live-classes/${id}/register`, { method: 'POST' }),

  // File Uploads
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload', { method: 'POST', body: formData });
  }
};
