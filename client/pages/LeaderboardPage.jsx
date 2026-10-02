import React from 'react';
import { Award, Trophy, Medal, Flame, Star, Sparkles, CheckCircle } from 'lucide-react';

export default function LeaderboardPage({ user, setActivePage }) {
  // Top demo learners ranking
  const leaderboardData = [
    { rank: 1, name: 'Dr. Sarah Mitchell', points: 1250, badge: 'Grand Master', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', coursesCompleted: 12 },
    { rank: 2, name: 'Elena Rostova', points: 890, badge: 'Distinguished Scholar', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', coursesCompleted: 8 },
    { rank: 3, name: 'David Miller', points: 740, badge: 'Quiz Virtuoso', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', coursesCompleted: 6 },
    { rank: 4, name: 'Alex Johnson (You)', points: user?.points || 380, badge: 'Quiz Ace', avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', coursesCompleted: 2, isCurrent: true },
    { rank: 5, name: 'Lucas Chen', points: 310, badge: 'Code Explorer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', coursesCompleted: 2 },
    { rank: 6, name: 'Aaliyah Patel', points: 260, badge: 'Fast Learner', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', coursesCompleted: 1 }
  ];

  return (
    <div className="container" style={{ maxWidth: 840, padding: '3rem 1.5rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
          <Trophy size={14} /> Student Rankings
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
          Global Learning Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
          Compete with students worldwide by completing video lessons, mastering quizzes, and claiming certificates.
        </p>
      </div>

      {/* Point scoring system cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            +250 Points
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Course 100% Completed
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.25rem' }}>
            +50 Points
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Quiz Passed (≥70%)
          </div>
        </div>

        <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)', marginBottom: '0.25rem' }}>
            +20 Points
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Course Review Submitted
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="card glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaderboardData.map((learner) => {
            const isTop3 = learner.rank <= 3;
            const rankColors = { 1: '#f59e0b', 2: '#94a3b8', 3: '#b45309' };

            return (
              <div
                key={learner.rank}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: learner.isCurrent
                    ? 'var(--primary-light)'
                    : isTop3
                    ? 'var(--bg-subtle)'
                    : 'transparent',
                  border: learner.isCurrent
                    ? '1.5px solid var(--primary)'
                    : '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isTop3 ? rankColors[learner.rank] : 'var(--bg-subtle)',
                    color: isTop3 ? '#fff' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {learner.rank}
                  </div>

                  <img
                    src={learner.avatar}
                    alt={learner.name}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                  />

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {learner.name}
                      {learner.isCurrent && (
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>YOU</span>
                      )}
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                      {learner.badge}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {learner.points} pts
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {learner.coursesCompleted} completed
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
