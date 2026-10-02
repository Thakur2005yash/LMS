import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import QuizPage from './pages/QuizPage';
import CertificatePage from './pages/CertificatePage';
import LiveClassesPage from './pages/LiveClassesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

// Dashboards
import StudentDashboard from './dashboard/StudentDashboard';
import InstructorDashboard from './dashboard/InstructorDashboard';

import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme (default to dark for modern, sleek recruiter aesthetic, or light if preferred)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lms_theme') || 'dark';
  });

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load current user from token on boot
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    const savedUser = localStorage.getItem('lms_user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // ignore
      }
    }

    if (token) {
      api.getMe()
        .then(res => {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('lms_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_user');
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
    setActivePage('home');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourseId(course._id || course.id);
    setActivePage('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLesson = (courseId, lessonId) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(lessonId);
    setActivePage('lesson-player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuiz = (courseId) => {
    setSelectedCourseId(courseId);
    setActivePage('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCertificate = (courseId) => {
    setSelectedCourseId(courseId);
    setActivePage('certificate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        theme={theme}
        setTheme={setTheme}
        onSearch={handleSearch}
      />

      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <HomePage
            user={user}
            onSelectCourse={handleSelectCourse}
            setActivePage={setActivePage}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activePage === 'courses' && (
          <CoursesPage
            user={user}
            onSelectCourse={handleSelectCourse}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        )}

        {activePage === 'course-detail' && (
          <CourseDetailPage
            courseId={selectedCourseId}
            user={user}
            onStartLesson={handleStartLesson}
            onOpenAuth={handleOpenAuth}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'lesson-player' && (
          <LessonPlayerPage
            courseId={selectedCourseId}
            initialLessonId={selectedLessonId}
            user={user}
            setActivePage={setActivePage}
            onOpenQuiz={handleOpenQuiz}
            onOpenCertificate={handleOpenCertificate}
          />
        )}

        {activePage === 'quiz' && (
          <QuizPage
            courseId={selectedCourseId}
            user={user}
            onBackToCourse={() => setActivePage('lesson-player')}
            onOpenCertificate={handleOpenCertificate}
          />
        )}

        {activePage === 'certificate' && (
          <CertificatePage
            courseId={selectedCourseId}
            user={user}
            onBackToCourse={() => setActivePage('course-detail')}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'student-dashboard' && (
          <StudentDashboard
            user={user}
            onSelectCourse={handleSelectCourse}
            onStartLesson={handleStartLesson}
            onOpenCertificate={handleOpenCertificate}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'instructor-dashboard' && (
          <InstructorDashboard
            user={user}
            onSelectCourse={handleSelectCourse}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'live-classes' && (
          <LiveClassesPage
            user={user}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activePage === 'leaderboard' && (
          <LeaderboardPage
            user={user}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        )}
      </main>

      <Footer setActivePage={setActivePage} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
