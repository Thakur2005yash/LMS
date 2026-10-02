import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Award, CheckCircle, Save } from 'lucide-react';
import { api } from '../services/api';

export default function ProfilePage({ user, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg('');
    try {
      const res = await api.updateProfile({ name, headline, bio, avatar });
      if (res.success) {
        onUpdateUser(res.user);
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      setProfileMsg(err.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPwdMsg('');
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPwdMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPwdMsg(''), 3000);
      }
    } catch (err) {
      setPwdMsg(err.message || 'Error changing password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 760, padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Account & Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your personal details, public bio, and authentication security.
        </p>
      </div>

      {/* Badges Earned Ribbon */}
      <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--primary)" /> Earned Achievement Badges
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {(user?.badges || ['New Explorer', 'Fast Learner']).map((b, i) => (
            <span key={i} className="badge badge-warning" style={{ padding: '0.4rem 0.85rem' }}>
              ⭐ {b}
            </span>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="card glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Personal Information
        </h2>

        {profileMsg && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {profileMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address (Read-only)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Headline / Role Tagline
          </label>
          <input
            type="text"
            placeholder="e.g. Aspiring Full-Stack Software Engineer"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Avatar Image URL
          </label>
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Bio
          </label>
          <textarea
            rows={3}
            placeholder="Tell fellow students and instructors about your tech journey..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Save size={16} /> Save Changes
        </button>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="card glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Change Password
        </h2>

        {pwdMsg && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: pwdMsg.includes('success') ? 'var(--success-bg)' : 'var(--danger-bg)', color: pwdMsg.includes('success') ? 'var(--success)' : 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {pwdMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-secondary" disabled={loading}>
          <Lock size={16} /> Update Password
        </button>
      </form>
    </div>
  );
}
