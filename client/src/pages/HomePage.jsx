import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle,
  Award,
  Users,
  Video,
  Bot,
  Zap,
  TrendingUp,
  Star,
  ShieldCheck,
  Compass
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { api } from '../services/api';

export default function HomePage({
  user,
  onSelectCourse,
  setActivePage,
  onOpenAuth
}) {
  const [featuredData, setFeaturedData] = useState({
    trending: [],
    topRated: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const res = await api.getFeaturedCourses();
      if (res.success) {
        setFeaturedData(res);
      }
    } catch (err) {
      console.error('Error loading featured courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 3rem',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Announcement Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}>
              <Sparkles size={14} /> New: AI Learning Assistant & Verifiable Certificates
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: 900,
            margin: '0 auto 1.5rem'
          }}>
            Master the Future of Software,{' '}
            <span style={{
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI & Digital Product Design
            </span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: 680,
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Level up your career with interactive video courses, hands-on quizzes, step-by-step projects, and automated verifiable certificates.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActivePage('courses')}
            >
              Explore Course Catalog <ArrowRight size={18} />
            </button>
            {!user ? (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => onOpenAuth('register')}
              >
                Join for Free
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setActivePage(user.role === 'instructor' ? 'instructor-dashboard' : 'student-dashboard')}
              >
                Go to My Dashboard
              </button>
            )}
          </div>

          {/* Metrics Ribbon */}
          <div
            className="glass-panel"
            style={{
              marginTop: '4rem',
              padding: '1.5rem 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>25,000+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Students</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>98.4%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Course Satisfaction</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Verifiable Certificates</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>24/7</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Learning Tutor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Trending Courses Section */}
      <section className="container">
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div>
            <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <TrendingUp size={16} /> Top Rated Learning Paths
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Trending Courses This Month
            </h2>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActivePage('courses')}
          >
            View All ({featuredData.trending.length}+) <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading premium courses...
          </div>
        ) : (
          <div className="grid-courses">
            {featuredData.trending.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onSelectCourse={onSelectCourse}
                isEnrolled={user && user.enrolledCourses && user.enrolledCourses.includes(course._id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Curriculum Categories */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 2.5rem' }}>
          <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            <Compass size={13} /> Disciplines
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore by Category</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            From full-stack web applications to artificial intelligence, pick your path.
          </p>
        </div>

        <div className="grid-courses">
          {(featuredData.categories || []).map((cat, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActivePage('courses')}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{cat.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {cat.count} Active Courses
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features / Why Choose Us */}
      <section style={{ background: 'var(--bg-surface)', padding: '5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Engineered for Modern Developers & Designers
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
              Everything you need to go from beginner to confident professional builder.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Video size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Cinema Video Streaming
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                HTTP Range video streaming with playback speed control, timestamp bookmarks, and automatic resume from where you left off.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CheckCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Auto-Graded Quizzes
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Test your mastery with Multiple Choice, True/False, and Fill-in-the-Blank questions with immediate scoring and detailed rationales.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                PDF Certificate of Completion
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Download official, tamper-proof PDF certificates with unique verification IDs ready to add directly to LinkedIn and your resume.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Bot size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                AI Learning Assistant
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Stuck on a concept? Chat with the built-in AI tutor to explain tricky code, get quiz hints, and receive instant explanations.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Community Q&A Forum
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Connect directly with instructors and peers. Ask lesson-specific questions, share project code, and upvote great solutions.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Gamified Leaderboards
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Earn skill points, unlock achievement badges, and climb the leaderboard as you complete lessons and quizzes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action banner */}
      <section className="container">
        <div style={{
          background: 'var(--primary-gradient)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(99, 102, 241, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Start Learning Today. Transform Your Career.
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: 600, margin: '0 auto 2rem' }}>
            Join over 25,000 students mastering full-stack engineering, AI, and design systems.
          </p>
          <button
            className="btn btn-secondary btn-lg"
            style={{ color: 'var(--text-primary)', fontWeight: 700, background: '#ffffff', border: 'none' }}
            onClick={() => setActivePage('courses')}
          >
            Browse All Courses Now <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
