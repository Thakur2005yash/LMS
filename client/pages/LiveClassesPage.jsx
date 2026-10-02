import React, { useState, useEffect } from 'react';
import {
  Tv,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Play,
  MessageSquare,
  Send,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveClassesPage({ user, onOpenAuth }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLiveRoom, setActiveLiveRoom] = useState(null);

  // Live room chat simulation state
  const [liveChatMessages, setLiveChatMessages] = useState([
    { sender: 'System', text: 'Welcome to the live session room! Be respectful to peers and instructor.' },
    { sender: 'Elena Rostova', text: 'Excited for today’s WebSocket architecture walkthrough!' },
    { sender: 'David Miller', text: 'Sound and video look super crisp.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    loadLiveClasses();
  }, []);

  const loadLiveClasses = async () => {
    try {
      const res = await api.getLiveClasses();
      if (res.success) {
        setClasses(res.liveClasses || []);
      }
    } catch (err) {
      console.error('Failed to load live classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (classId) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }

    try {
      const res = await api.registerLiveClass(classId);
      if (res.success) {
        setClasses(classes.map(c => {
          if (c._id === classId) {
            return {
              ...c,
              registeredCount: res.registeredCount,
              registeredUsers: [...(c.registeredUsers || []), user._id]
            };
          }
          return c;
        }));
      }
    } catch (err) {
      alert(err.message || 'Error registering for live session.');
    }
  };

  const handleSendLiveChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLiveChatMessages([
      ...liveChatMessages,
      { sender: user?.name || 'Guest Student', text: chatInput.trim() }
    ]);
    setChatInput('');
  };

  // If student entered the interactive live room
  if (activeLiveRoom) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.25rem' }}
          onClick={() => setActiveLiveRoom(null)}
        >
          <ChevronLeft size={16} /> Exit Live Room
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem' }}>
          {/* Main Video Stream */}
          <div>
            <div style={{ background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-danger" style={{ animation: 'pulseGlow 2s infinite' }}>
                  🔴 LIVE
                </span>
                <span className="badge badge-secondary" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none' }}>
                  <Users size={12} /> 482 watching
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeLiveRoom.title}</h1>
              <div className="flex items-center gap-3" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                <img
                  src={activeLiveRoom.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60'}
                  alt={activeLiveRoom.instructorName}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span>Hosted by <strong>{activeLiveRoom.instructorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive Live Chat */}
          <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 500, padding: '1rem' }}>
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.95rem' }}>
              Live Session Chat
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.75rem 0' }}>
              {liveChatMessages.map((msg, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: 6 }}>
                    {msg.sender}:
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendLiveChat} className="flex gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <input
                type="text"
                placeholder={user ? "Send a live message..." : "Sign in to participate"}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={!user}
                style={{ height: 36, fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!user}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: 680, margin: '0 auto 3rem' }}>
        <div className="badge badge-danger" style={{ marginBottom: '0.5rem' }}>
          <Tv size={14} /> Interactive Live Masterclasses
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
          Upcoming Webinars & Live Coding Rooms
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
          Join real-time coding sessions, ask questions live on stream, and build projects alongside master instructors.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading scheduled masterclasses...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {classes.map((item) => {
            const isRegistered = user && item.registeredUsers && item.registeredUsers.includes(user._id);
            const dateObj = new Date(item.scheduledAt);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={item._id}
                className="card glass-panel"
                style={{
                  padding: '2rem',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: '2rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">{item.category}</span>
                    <span className="badge badge-secondary">{item.level}</span>
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {dateStr} at {timeStr}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <img
                        src={item.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60'}
                        alt={item.instructorName}
                        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span>{item.instructorName}</span>
                    </div>

                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {item.durationMinutes} mins
                    </span>

                    <span className="flex items-center gap-1">
                      <Users size={14} /> {item.registeredCount || 0} registered
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 170 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveLiveRoom(item)}
                  >
                    <Play size={16} fill="#fff" /> Enter Live Room
                  </button>

                  {!isRegistered ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRegister(item._id)}
                    >
                      Save My Spot
                    </button>
                  ) : (
                    <span className="badge badge-success" style={{ textAlign: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={12} /> Registered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
