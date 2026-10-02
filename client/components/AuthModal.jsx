import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (mode === 'login') {
        res = await api.login({ email: formData.email, password: formData.password });
      } else {
        res = await api.register(formData);
      }

      if (res.token && res.user) {
        localStorage.setItem('lms_token', res.token);
        localStorage.setItem('lms_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-Fill helper
  const handleQuickLogin = (email, password) => {
    setFormData({ ...formData, email, password });
    setMode('login');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {mode === 'login' ? 'Welcome Back to LearnHub' : 'Create Your Free Account'}
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: mode === 'login' ? 700 : 500,
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: mode === 'login' ? '2.5px solid var(--primary)' : 'none',
              background: 'transparent'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: mode === 'register' ? 700 : 500,
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: mode === 'register' ? '2.5px solid var(--primary)' : 'none',
              background: 'transparent'
            }}
          >
            Register
          </button>
        </div>

        {/* Quick Demo Credentials Pill Bar */}
        <div style={{ padding: '1rem 1.5rem 0.5rem', background: 'var(--bg-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ⚡ 1-Click Demo Profiles (For Instant Evaluation):
          </div>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="badge badge-primary"
              style={{ cursor: 'pointer', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickLogin('student@learnhub.com', 'student123')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className="badge badge-warning"
              style={{ cursor: 'pointer', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickLogin('instructor@learnhub.com', 'instructor123')}
            >
              👨‍🏫 Instructor
            </button>
            <button
              type="button"
              className="badge badge-secondary"
              style={{ cursor: 'pointer', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickLogin('admin@learnhub.com', 'admin123')}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                required
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                I want to join as:
              </label>
              <div className="flex gap-4">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  🎓 Student Learner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="role"
                    value="instructor"
                    checked={formData.role === 'instructor'}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  👨‍🏫 Instructor / Educator
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
