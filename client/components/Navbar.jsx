import React, { useState } from 'react';
import {
  GraduationCap,
  Sun,
  Moon,
  Search,
  BookOpen,
  Tv,
  Award,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  activePage,
  setActivePage,
  theme,
  setTheme,
  onSearch
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
      setActivePage('courses');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('lms_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-color)',
      borderRadius: 0,
      padding: '0.75rem 0'
    }}>
      <div className="container flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setActivePage('home')}
        >
          <div style={{
            background: 'var(--primary-gradient)',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              LearnHub
            </span>
            <span className="badge badge-primary" style={{ marginLeft: 6, fontSize: '0.65rem', verticalAlign: 'middle' }}>
              PRO
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '0 1 340px', display: 'none', position: 'relative' }} className="nav-search-form">
          <input
            type="text"
            placeholder="Search courses, skills, instructors..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              height: 38,
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
        </form>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 nav-links-desktop">
          <button
            onClick={() => setActivePage('courses')}
            className={`btn-nav-link ${activePage === 'courses' ? 'active' : ''}`}
            style={{
              color: activePage === 'courses' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activePage === 'courses' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.92rem'
            }}
          >
            <BookOpen size={16} />
            Courses
          </button>

          <button
            onClick={() => setActivePage('live-classes')}
            className={`btn-nav-link ${activePage === 'live-classes' ? 'active' : ''}`}
            style={{
              color: activePage === 'live-classes' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activePage === 'live-classes' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.92rem'
            }}
          >
            <Tv size={16} />
            Live Classes
          </button>

          <button
            onClick={() => setActivePage('leaderboard')}
            className={`btn-nav-link ${activePage === 'leaderboard' ? 'active' : ''}`}
            style={{
              color: activePage === 'leaderboard' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activePage === 'leaderboard' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.92rem'
            }}
          >
            <Award size={16} />
            Leaderboard
          </button>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark / Light Theme"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* User Logged In vs Logged Out State */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                className="flex items-center gap-2"
                style={{
                  cursor: 'pointer',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)'
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                  ⭐ {user.points || 100}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 230,
                    background: 'var(--bg-surface-elevated)',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '0.5rem',
                    zIndex: 110
                  }}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <span className="badge badge-primary" style={{ marginTop: '0.4rem', fontSize: '0.65rem' }}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setActivePage(user.role === 'instructor' ? 'instructor-dashboard' : 'student-dashboard');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    className="dropdown-item"
                  >
                    <LayoutDashboard size={16} />
                    {user.role === 'instructor' ? 'Instructor Dashboard' : 'My Learning'}
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setActivePage('profile');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    className="dropdown-item"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.35rem 0' }} />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.88rem',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    className="dropdown-item"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenAuth('login')}
              >
                Log In
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('register')}
              >
                <Sparkles size={14} />
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
