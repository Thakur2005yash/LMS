import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Star,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Upload,
  X,
  CheckCircle,
  Video,
  FileText,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function InstructorDashboard({
  user,
  onSelectCourse,
  setActivePage
}) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Course Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Development',
    difficulty: 'Beginner',
    price: 29.99,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    tags: 'React, Node.js',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Getting Started',
        lessons: [
          {
            id: 'les-1',
            title: 'Introduction & Setup',
            duration: 360,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            preview: true,
            description: 'Course overview and environment setup.'
          }
        ]
      }
    ]
  });

  // Students list modal
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes] = await Promise.all([
        api.getInstructorStats(),
        api.getInstructorCourses()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (coursesRes.success) setCourses(coursesRes.courses || []);
    } catch (err) {
      console.error('Failed to load instructor analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const tagsArray = typeof newCourse.tags === 'string'
        ? newCourse.tags.split(',').map(t => t.trim())
        : newCourse.tags;

      const res = await api.createCourse({
        ...newCourse,
        tags: tagsArray
      });

      if (res.success) {
        setShowCreateModal(false);
        await loadInstructorData();
      }
    } catch (err) {
      alert(err.message || 'Error creating course.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to permanently delete this course? This will remove all enrollments and quiz records.')) return;
    try {
      await api.deleteCourse(courseId);
      await loadInstructorData();
    } catch (err) {
      alert(err.message || 'Error deleting course.');
    }
  };

  const handleViewStudents = async (course) => {
    setSelectedCourseForStudents(course);
    setLoadingStudents(true);
    try {
      const res = await api.getCourseStudents(course._id);
      if (res.success) {
        setCourseStudents(res.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-warning" style={{ marginBottom: '0.4rem' }}>
              Instructor Center
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Instructor Performance & Course Studio
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your curriculum, review enrolled students, and track real-time revenue analytics.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Create New Course
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '3rem' }}>
        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.totalStudents || 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Students</div>
            </div>
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${(stats?.totalRevenue || 0).toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Revenue</div>
            </div>
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.averageRating || '5.0'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Rating</div>
            </div>
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{courses.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Courses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Management Table */}
      <div className="card glass-panel" style={{ padding: '1.75rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Your Published Courses
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading course portfolio...
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You have not published any courses yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              Launch Your First Course
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Course</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>Students</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      style={{ width: 44, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.modules ? c.modules.length : 0} modules
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-secondary">{c.category}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>
                    {c.price === 0 ? 'FREE' : `$${c.price}`}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      className="badge badge-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleViewStudents(c)}
                    >
                      {c.studentsCount || 0} Students
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    ⭐ {c.rating || 5.0} ({c.ratingCount || 0})
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectCourse(c)}
                        title="View Course Page"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteCourse(c._id)}
                        style={{ color: 'var(--danger)' }}
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE NEW COURSE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650, padding: 0 }}>
            <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create New Course</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Next.js 15 & Full-Stack TypeScript"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Subtitle / Quick Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build production SaaS apps from scratch"
                  value={newCourse.subtitle}
                  onChange={(e) => setNewCourse({ ...newCourse, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  >
                    <option value="Development">Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Difficulty Level
                  </label>
                  <select
                    value={newCourse.difficulty}
                    onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Thumbnail Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Course Description & Curriculum Overview
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide in-depth information about what students will build and master..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Next.js, Fullstack, TypeScript"
                  value={newCourse.tags}
                  onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Publishing Course...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLLED STUDENTS MODAL */}
      {selectedCourseForStudents && (
        <div className="modal-overlay" onClick={() => setSelectedCourseForStudents(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, padding: 0 }}>
            <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Enrolled Students</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedCourseForStudents.title}
                </span>
              </div>
              <button onClick={() => setSelectedCourseForStudents(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: 400, overflowY: 'auto' }}>
              {loadingStudents ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Fetching student roster...
                </div>
              ) : courseStudents.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No students currently enrolled in this course yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {courseStudents.map((st) => (
                    <div
                      key={st.enrollmentId}
                      className="card"
                      style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                          alt={st.name}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{st.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {st.progress}% Complete
                        </div>
                        {st.isCompleted && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            Certificate Earned
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
