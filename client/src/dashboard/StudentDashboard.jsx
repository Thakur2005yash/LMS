import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  Play,
  Flame,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboard({
  user,
  onSelectCourse,
  onStartLesson,
  onOpenCertificate,
  setActivePage
}) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'in-progress' | 'completed'

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const res = await api.getMyEnrollments();
      if (res.success) {
        setEnrollments(res.enrollments || []);
      }
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const inProgress = enrollments.filter(e => !e.isCompleted);
  const completed = enrollments.filter(e => e.isCompleted);

  const displayedList =
    filterTab === 'in-progress'
      ? inProgress
      : filterTab === 'completed'
      ? completed
      : enrollments;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
              Student Learning Hub
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Track your coursework, pick up where you left off, and claim certificates.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setActivePage('courses')}
          >
            Explore More Courses <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{enrollments.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enrolled Courses</div>
            </div>
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completed.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Courses Completed</div>
            </div>
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completed.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certificates Earned</div>
            </div>
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.points || 380}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skill Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
        <button
          className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterTab('all')}
        >
          All Courses ({enrollments.length})
        </button>
        <button
          className={`btn btn-sm ${filterTab === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterTab('in-progress')}
        >
          In Progress ({inProgress.length})
        </button>
        <button
          className={`btn btn-sm ${filterTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterTab('completed')}
        >
          Completed ({completed.length})
        </button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading your learning records...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {filterTab === 'completed' ? 'No Completed Courses Yet' : 'No Enrolled Courses'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            {filterTab === 'completed'
              ? 'Complete all modules and lessons in your enrolled courses to earn verifiable certificates.'
              : 'Discover world-class tech courses and start learning today.'}
          </p>
          <button className="btn btn-primary" onClick={() => setActivePage('courses')}>
            Browse Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedList.map((enr) => (
            <div
              key={enr._id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '180px minmax(0, 1fr) auto',
                gap: '1.5rem',
                alignItems: 'center'
              }}
            >
              {/* Thumbnail */}
              <div style={{ width: 180, height: 110, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={enr.course?.thumbnail || enr.courseThumbnail}
                  alt={enr.courseTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Title & Progress Bar */}
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                    {enr.course?.category || 'Professional Track'}
                  </span>
                  {enr.isCompleted && (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      Completed
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  {enr.courseTitle}
                </h3>

                <div>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Completion</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{enr.progress}%</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${enr.progress}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 160 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onStartLesson(enr.courseId, enr.currentLessonId)}
                >
                  <Play size={14} /> {enr.isCompleted ? 'Review Course' : 'Resume Learning'}
                </button>

                {enr.isCompleted && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenCertificate(enr.courseId)}
                    style={{ borderColor: 'var(--warning)', color: '#d97706' }}
                  >
                    <Award size={14} /> View Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
