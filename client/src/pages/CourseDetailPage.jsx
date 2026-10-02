import React, { useState, useEffect } from 'react';
import {
  Star,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  Play,
  Share2,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  ShieldCheck,
  Send,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function CourseDetailPage({
  courseId,
  user,
  onStartLesson,
  onOpenAuth,
  setActivePage
}) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [reviewsData, setReviewsData] = useState({ reviews: [], distribution: {} });

  // New Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Video Preview modal state
  const [previewLesson, setPreviewLesson] = useState(null);

  useEffect(() => {
    loadCourseDetails();
    loadReviews();
  }, [courseId]);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getCourseById(courseId);
      if (res.success) {
        setCourse(res.course);
        // Expand first module by default
        if (res.course.modules && res.course.modules.length > 0) {
          setExpandedModules({ [res.course.modules[0].id]: true });
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.getReviews(courseId);
      if (res.success) {
        setReviewsData(res);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleEnroll = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setEnrolling(true);
    try {
      const res = await api.enrollCourse(courseId, 'credit_card');
      if (res.success) {
        // Refresh course to update enrollment status
        await loadCourseDetails();
        // Redirect to learning player
        if (course.modules && course.modules[0] && course.modules[0].lessons && course.modules[0].lessons[0]) {
          onStartLesson(course._id, course.modules[0].lessons[0].id);
        }
      }
    } catch (err) {
      alert(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      const res = await api.addReview(courseId, {
        rating: newRating,
        comment: newComment
      });
      if (res.success) {
        setReviewMsg('Thank you! Your review has been published.');
        setNewComment('');
        await loadReviews();
        await loadCourseDetails();
      }
    } catch (err) {
      setReviewMsg(err.message || 'Error submitting review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    try {
      await api.deleteReview(reviewId);
      await loadReviews();
      await loadCourseDetails();
    } catch (err) {
      alert(err.message || 'Failed to delete review.');
    }
  };

  if (loading || !course) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading comprehensive course syllabus...
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;
  const totalDurationMins = Math.round((course.totalDurationSeconds || 1800) / 60);
  const hours = Math.floor(totalDurationMins / 60);
  const mins = totalDurationMins % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Dark / Atmospheric Course Header Hero */}
      <section style={{
        background: 'var(--bg-surface-elevated)',
        borderBottom: '1px solid var(--border-color)',
        padding: '3.5rem 0'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '3rem', alignItems: 'start' }}>
          {/* Left Column: Title, Description, Meta */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{course.category}</span>
              <span className="badge badge-secondary">{course.difficulty}</span>
              <span className="badge badge-success">Updated 2026</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
              {course.title}
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {course.subtitle || course.description.slice(0, 160) + '...'}
            </p>

            {/* Ratings & Instructor */}
            <div className="flex items-center gap-6" style={{ flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <div className="flex items-center gap-1">
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{course.rating || 5.0}</span>
                <span style={{ color: 'var(--text-muted)' }}>({course.ratingCount || 1} ratings)</span>
              </div>

              <div style={{ color: 'var(--text-secondary)' }}>
                <strong>{(course.enrolledCount || 0).toLocaleString()}</strong> students enrolled
              </div>

              <div className="flex items-center gap-2">
                <img
                  src={course.instructor.avatar || course.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60'}
                  alt={course.instructor.name}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span>Created by <strong style={{ color: 'var(--primary)' }}>{course.instructor.name}</strong></span>
              </div>
            </div>
          </div>

          {/* Floating Course Purchase / Action Card */}
          <div className="card glass-panel" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-xl)', position: 'sticky', top: 90 }}>
            {/* Thumbnail preview */}
            <div style={{ position: 'relative', width: '100%', height: 190, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (course.modules && course.modules[0] && course.modules[0].lessons && course.modules[0].lessons[0]) {
                    setPreviewLesson(course.modules[0].lessons[0]);
                  }
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.6)'
                }}>
                  <Play size={24} fill="#fff" style={{ marginLeft: 3 }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Watch Course Preview</span>
              </button>
            </div>

            {/* Price & Action */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-baseline gap-2">
                <span style={{ fontSize: '2rem', fontWeight: 800, color: course.price === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                  {course.price === 0 ? 'FREE' : `$${course.price.toFixed(2)}`}
                </span>
                {course.price > 0 && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1rem' }}>
                    ${(course.price * 2.2).toFixed(2)}
                  </span>
                )}
                {course.price > 0 && (
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>55% OFF</span>
                )}
              </div>
            </div>

            {isEnrolled ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>Course Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{course.progress || 0}%</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: 8 }}>
                    <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }} />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const firstLesson = course.modules?.[0]?.lessons?.[0];
                    if (firstLesson) onStartLesson(course._id, firstLesson.id);
                  }}
                >
                  <Play size={18} /> Continue Learning
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '0.75rem' }}
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll in Free Course' : 'Enroll Now'}
              </button>
            )}

            {/* Course Inclusions Checklist */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                This course includes:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li className="flex items-center gap-2">
                  <Clock size={15} color="var(--primary)" /> {durationStr} on-demand video
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen size={15} color="var(--primary)" /> {course.totalLessons} practical lessons
                </li>
                <li className="flex items-center gap-2">
                  <FileText size={15} color="var(--primary)" /> Downloadable architecture guides
                </li>
                <li className="flex items-center gap-2">
                  <Award size={15} color="var(--primary)" /> Verifiable Certificate of Completion
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles size={15} color="var(--primary)" /> 24/7 AI Tutor Assistant access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Course Body Container */}
      <div className="container" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '3rem' }}>
        <div>
          {/* What You'll Learn Box */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              What You'll Learn
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {(course.learningOutcomes || [
                'Architect scalable, production-ready applications',
                'Implement robust security, authentication, and state patterns',
                'Write clean, maintainable, and well-tested code'
              ]).map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Section Accordion */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Course Curriculum</h2>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {course.modules ? course.modules.length : 0} modules • {course.totalLessons} lessons • {durationStr} total length
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(course.modules || []).map((mod, modIdx) => {
                const isExpanded = !!expandedModules[mod.id];
                return (
                  <div key={mod.id || modIdx} className="card" style={{ overflow: 'hidden' }}>
                    {/* Module Header */}
                    <div
                      className="flex items-center justify-between"
                      style={{
                        padding: '1rem 1.25rem',
                        background: 'var(--bg-subtle)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.98rem'
                      }}
                      onClick={() => toggleModule(mod.id)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <span>{mod.title}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {mod.lessons ? mod.lessons.length : 0} lessons
                      </span>
                    </div>

                    {/* Lessons list */}
                    {isExpanded && (
                      <div style={{ padding: '0.5rem 0' }}>
                        {(mod.lessons || []).map((lesson, lesIdx) => {
                          const mins = Math.floor((lesson.duration || 300) / 60);
                          const secs = (lesson.duration || 300) % 60;
                          const dur = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

                          return (
                            <div
                              key={lesson.id || lesIdx}
                              className="flex items-center justify-between"
                              style={{
                                padding: '0.75rem 1.25rem',
                                borderBottom: '1px solid var(--border-light)',
                                fontSize: '0.9rem',
                                transition: 'background var(--transition-fast)'
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {isEnrolled || lesson.preview ? (
                                  <Play size={16} color="var(--primary)" />
                                ) : (
                                  <Lock size={15} color="var(--text-muted)" />
                                )}
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {lesson.preview && (
                                  <button
                                    type="button"
                                    className="badge badge-primary"
                                    style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                                    onClick={() => setPreviewLesson(lesson)}
                                  >
                                    Preview
                                  </button>
                                )}
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {dur}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requirements Box */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Requirements</h2>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem' }}>
              {(course.requirements || ['Basic computer and browser literacy']).map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Detailed Description */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Description</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {course.description}
            </div>
          </div>

          {/* Instructor Bio Box */}
          <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
            <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
              <img
                src={course.instructor.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120'}
                alt={course.instructor.name}
                style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{course.instructor.name}</h3>
                <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {course.instructor.headline || 'Senior Instructor & Engineer'}
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
              {course.instructor.bio || 'Experienced educator and developer passionate about high-impact software design.'}
            </p>
          </div>

          {/* Student Reviews & Ratings Section */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              Student Feedback & Reviews ({reviewsData.reviews ? reviewsData.reviews.length : 0})
            </h2>

            {/* Rating breakdown summary */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: 120 }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--primary)' }}>
                  {course.rating || 5.0}
                </div>
                <div className="flex justify-center items-center gap-1" style={{ margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Course Rating
                </div>
              </div>

              {/* Progress bars for stars */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 220 }}>
                {[5, 4, 3, 2, 1].map(starNum => {
                  const count = (reviewsData.distribution && reviewsData.distribution[starNum]) || 0;
                  const totalCount = reviewsData.reviews ? reviewsData.reviews.length : 1;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={starNum} className="flex items-center gap-2" style={{ fontSize: '0.8rem' }}>
                      <span style={{ width: 45, color: 'var(--text-muted)' }}>{starNum} stars</span>
                      <div className="progress-bar-container" style={{ height: 6, flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ width: 35, textAlign: 'right', color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit a Review Form (if enrolled) */}
            {isEnrolled && (
              <form onSubmit={handleReviewSubmit} className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Leave Your Honest Review
                </h3>
                {reviewMsg && (
                  <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {reviewMsg}
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Your Rating:
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        style={{ padding: 4 }}
                      >
                        <Star
                          size={24}
                          color="#f59e0b"
                          fill={star <= newRating ? '#f59e0b' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <textarea
                    rows={3}
                    placeholder="What did you learn? What was your favorite aspect of this course?"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={reviewSubmitting}
                >
                  <Send size={14} /> {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(reviewsData.reviews || []).map((rev) => (
                <div key={rev._id} className="card" style={{ padding: '1.25rem' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                        alt={rev.userName}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.userName}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              size={12}
                              color="#f59e0b"
                              fill={s <= rev.rating ? '#f59e0b' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {user && (user._id === rev.userId || user.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        style={{ color: 'var(--danger)', padding: 4 }}
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Placeholder / Spacer for Desktop */}
        <div style={{ display: 'none' }} />
      </div>

      {/* Video Preview Modal */}
      {previewLesson && (
        <div className="modal-overlay" onClick={() => setPreviewLesson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760, padding: 0 }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Preview: {previewLesson.title}</div>
              <button onClick={() => setPreviewLesson(null)}>✕</button>
            </div>
            <div style={{ background: '#000', aspectRatio: '16/9' }}>
              <video
                src={previewLesson.videoUrl}
                controls
                autoPlay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
