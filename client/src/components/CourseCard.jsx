import React from 'react';
import { Star, Clock, BookOpen, CheckCircle, ArrowRight, Play } from 'lucide-react';

export default function CourseCard({ course, onSelectCourse, isEnrolled, progress }) {
  // Format duration in minutes / hours
  const totalDurationMins = Math.round((course.totalDurationSeconds || 1800) / 60);
  const hours = Math.floor(totalDurationMins / 60);
  const mins = totalDurationMins % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        height: '100%',
        position: 'relative'
      }}
      onClick={() => onSelectCourse(course)}
    >
      {/* Thumbnail Container */}
      <div style={{ position: 'relative', width: '100%', height: 170, overflow: 'hidden' }}>
        <img
          src={course.thumbnail}
          alt={course.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          loading="lazy"
        />

        {/* Category Pill */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-primary" style={{ backdropFilter: 'blur(8px)', background: 'rgba(99, 102, 241, 0.9)', color: '#fff' }}>
            {course.category}
          </span>
        </div>

        {/* Difficulty Pill */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className="badge badge-secondary" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', border: 'none' }}>
            {course.difficulty}
          </span>
        </div>

        {/* Play overlay hover indicator */}
        <div
          className="play-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease'
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.5)'
          }}>
            <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: '0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
          <img
            src={course.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60'}
            alt={course.instructorName}
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {course.instructorName}
          </span>
        </div>

        {/* Meta Stats: Rating, Duration, Lessons */}
        <div className="flex items-center justify-between" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <div className="flex items-center gap-1">
            <Star size={15} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{course.rating || 5.0}</span>
            <span>({course.ratingCount || 10})</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {durationStr}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={13} /> {course.totalLessons || 4}
            </span>
          </div>
        </div>

        {/* Progress or Pricing Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          {isEnrolled ? (
            <div>
              <div className="flex items-center justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Your Progress</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{progress || 0}%</span>
              </div>
              <div className="progress-bar-container" style={{ height: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${progress || 0}%` }} />
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCourse(course);
                }}
              >
                Continue Learning <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tuition</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: course.price === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                  {course.price === 0 ? 'FREE' : `$${course.price.toFixed(2)}`}
                </span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCourse(course);
                }}
              >
                Enroll Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
