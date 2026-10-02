import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  MessageSquare,
  Bot,
  Award,
  Sparkles,
  Download,
  Send,
  ThumbsUp,
  RotateCcw,
  CheckSquare,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function LessonPlayerPage({
  courseId,
  initialLessonId,
  user,
  setActivePage,
  onOpenQuiz,
  onOpenCertificate
}) {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // overview | resources | discussion | ai-tutor | notes

  // Video State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Discussion state
  const [discussions, setDiscussions] = useState([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionMsg, setNewQuestionMsg] = useState('');
  const [replyInput, setReplyInput] = useState({});

  // AI Tutor chat state
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      sender: 'ai',
      text: '👋 Hi! I am your AI Learning Assistant for this lesson. Ask me any question about the concepts covered, request code explanations, or get hints!'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Personal notes state (saved to localStorage per lesson)
  const [notes, setNotes] = useState('');
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  useEffect(() => {
    loadCourseAndProgress();
  }, [courseId]);

  // Load saved notes when current lesson changes
  useEffect(() => {
    if (currentLesson) {
      const saved = localStorage.getItem(`lms_notes_${courseId}_${currentLesson.id}`);
      setNotes(saved || '');
    }
  }, [currentLesson, courseId]);

  // Save progress heartbeat (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && currentLesson && !videoRef.current.paused) {
        saveProgress(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentLesson, currentTime, duration]);

  const loadCourseAndProgress = async () => {
    try {
      const courseRes = await api.getCourseById(courseId);
      if (courseRes.success) {
        setCourse(courseRes.course);

        // Fetch user progress
        let progressRes;
        try {
          progressRes = await api.getProgress(courseId);
        } catch (e) {
          // not enrolled yet or guest
        }

        const comp = progressRes?.progress?.completedLessons || [];
        setCompletedLessons(comp);
        setProgressPercent(progressRes?.progress?.percentage || 0);

        // Pick active lesson
        let targetLesson = null;
        let targetModule = null;

        if (courseRes.course.modules) {
          for (const mod of courseRes.course.modules) {
            if (mod.lessons) {
              const match = mod.lessons.find(l => l.id === (initialLessonId || progressRes?.progress?.currentLessonId));
              if (match) {
                targetLesson = match;
                targetModule = mod;
                break;
              }
            }
          }

          // Fallback to first lesson
          if (!targetLesson && courseRes.course.modules[0]?.lessons?.[0]) {
            targetLesson = courseRes.course.modules[0].lessons[0];
            targetModule = courseRes.course.modules[0];
          }
        }

        if (targetLesson) {
          selectLesson(targetLesson, targetModule);
        }
      }
    } catch (err) {
      console.error('Failed to load course player:', err);
    }
  };

  const selectLesson = async (lesson, mod) => {
    setCurrentLesson(lesson);
    if (mod) setCurrentModule(mod);
    setIsPlaying(false);

    // Load discussions for this lesson
    try {
      const discRes = await api.getDiscussions(courseId, lesson.id);
      if (discRes.success) {
        setDiscussions(discRes.discussions);
      }
    } catch (err) {
      console.error('Failed to load discussions:', err);
    }

    // Reset video time
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const saveProgress = async (markComplete = false) => {
    if (!currentLesson || !videoRef.current) return;
    try {
      const res = await api.updateVideoProgress(courseId, {
        lessonId: currentLesson.id,
        currentTime: Math.round(videoRef.current.currentTime),
        duration: Math.round(videoRef.current.duration || currentLesson.duration || 300),
        markComplete
      });

      if (res.success) {
        setCompletedLessons(res.completedLessons);
        setProgressPercent(res.progress);

        if (res.isCompleted) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Error saving video progress:', err);
    }
  };

  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await api.toggleLessonCompletion(courseId, lessonId);
      if (res.success) {
        setCompletedLessons(res.completedLessons);
        setProgressPercent(res.progress);
        if (res.isCompleted) {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.error('Error toggling complete:', err);
    }
  };

  // Video Controls Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || currentLesson?.duration || 0);

      // Auto-mark complete if >= 90% watched
      if (videoRef.current.duration > 0 &&
          videoRef.current.currentTime >= videoRef.current.duration * 0.9 &&
          !completedLessons.includes(currentLesson.id)) {
        saveProgress(true);
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (spd) => {
    setPlaybackSpeed(spd);
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Navigation: Next / Previous
  const allLessons = [];
  if (course && course.modules) {
    course.modules.forEach(m => {
      if (m.lessons) {
        m.lessons.forEach(l => allLessons.push({ lesson: l, module: m }));
      }
    });
  }

  const currentIndex = allLessons.findIndex(item => item.lesson.id === currentLesson?.id);
  const prevItem = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextItem = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // AI Tutor Send
  const handleAiSend = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await api.chatWithAiTutor({
        message: userText,
        courseId,
        lessonTitle: currentLesson?.title
      });

      if (res.success) {
        setAiChatMessages(prev => [...prev, {
          sender: 'ai',
          text: res.reply,
          suggestions: res.suggestions
        }]);
      }
    } catch (err) {
      setAiChatMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I encountered a temporary network error. Please try asking again!'
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Discussions Post
  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newQuestionTitle.trim() || !newQuestionMsg.trim()) return;

    try {
      const res = await api.createDiscussion(courseId, {
        title: newQuestionTitle,
        message: newQuestionMsg,
        lessonId: currentLesson?.id,
        lessonTitle: currentLesson?.title
      });

      if (res.success) {
        setDiscussions([res.discussion, ...discussions]);
        setNewQuestionTitle('');
        setNewQuestionMsg('');
      }
    } catch (err) {
      alert(err.message || 'Error posting question.');
    }
  };

  // Reply to thread
  const handleReplyDiscussion = async (threadId) => {
    const text = replyInput[threadId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.replyDiscussion(threadId, text);
      if (res.success) {
        setDiscussions(discussions.map(d => d._id === threadId ? res.discussion : d));
        setReplyInput({ ...replyInput, [threadId]: '' });
      }
    } catch (err) {
      alert(err.message || 'Error replying to thread.');
    }
  };

  // Upvote thread
  const handleLikeDiscussion = async (threadId) => {
    try {
      const res = await api.likeDiscussion(threadId);
      if (res.success) {
        setDiscussions(discussions.map(d => {
          if (d._id === threadId) {
            return { ...d, likes: res.likes };
          }
          return d;
        }));
      }
    } catch (err) {
      console.error('Error liking discussion:', err);
    }
  };

  // Personal notes save
  const handleSaveNotes = () => {
    if (currentLesson) {
      localStorage.setItem(`lms_notes_${courseId}_${currentLesson.id}`, notes);
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 2000);
    }
  };

  if (!course || !currentLesson) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Preparing classroom environment...
      </div>
    );
  }

  const formatSecs = (sec) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentCompleted = completedLessons.includes(currentLesson.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 65px)' }}>
      {/* Top Header Bar */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('course-detail')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            <ChevronLeft size={16} /> Course Overview
          </button>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>{course.title}</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {currentModule?.title} • {currentLesson?.title}
            </div>
          </div>
        </div>

        {/* Course Progress Status in Header */}
        <div className="flex items-center gap-4">
          <div style={{ minWidth: 160 }}>
            <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600 }}>Curriculum Progress</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{progressPercent}%</span>
            </div>
            <div className="progress-bar-container" style={{ height: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {progressPercent >= 100 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onOpenCertificate(course._id)}
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              <Award size={14} /> Claim Certificate
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Split: Video Player on Left, Sidebar on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', flex: 1 }}>
        {/* Left Column: Video & Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {/* Cinema Video Player Container */}
          <div style={{ background: '#000', position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '68vh' }}>
            <video
              ref={videoRef}
              src={currentLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => saveProgress(true)}
              onClick={togglePlay}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {/* Custom Control Bar Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              padding: '1.25rem 1.25rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: '#fff'
            }}>
              {/* Scrub timeline */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer',
                  height: 4,
                  padding: 0
                }}
              />

              {/* Controls row */}
              <div className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#fff" />}
                  </button>

                  <button onClick={toggleMute} style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    {formatSecs(currentTime)} / {formatSecs(duration || currentLesson.duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1">
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          background: playbackSpeed === spd ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                          color: '#fff'
                        }}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button onClick={handleFullscreen} style={{ color: '#fff' }}>
                    <Maximize size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Navigation Bar below video */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div className="flex items-center gap-2">
              <button
                className={`btn ${isCurrentCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                onClick={() => handleToggleComplete(currentLesson.id)}
              >
                <CheckCircle size={15} color={isCurrentCompleted ? 'var(--success)' : '#fff'} />
                {isCurrentCompleted ? 'Completed' : 'Mark as Complete'}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenQuiz(course._id)}
              >
                <Award size={15} color="var(--primary)" /> Take Course Quiz
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-secondary btn-sm"
                disabled={!prevItem}
                onClick={() => prevItem && selectLesson(prevItem.lesson, prevItem.module)}
              >
                <ChevronLeft size={16} /> Previous Lesson
              </button>

              <button
                className="btn btn-primary btn-sm"
                disabled={!nextItem}
                onClick={() => {
                  saveProgress(true);
                  if (nextItem) selectLesson(nextItem.lesson, nextItem.module);
                }}
              >
                Next Lesson <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Interactive Classroom Tabs */}
          <div style={{ padding: '1.5rem', flex: 1 }}>
            {/* Tab header buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('overview')}
              >
                <BookOpen size={15} /> Overview & Notes
              </button>

              <button
                className={`btn btn-sm ${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('resources')}
              >
                <Download size={15} /> Resources ({currentLesson.resources ? currentLesson.resources.length : 0})
              </button>

              <button
                className={`btn btn-sm ${activeTab === 'discussion' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('discussion')}
              >
                <MessageSquare size={15} /> Discussion Q&A ({discussions.length})
              </button>

              <button
                className={`btn btn-sm ${activeTab === 'ai-tutor' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('ai-tutor')}
                style={{ background: activeTab === 'ai-tutor' ? 'var(--primary-gradient)' : '' }}
              >
                <Bot size={15} /> AI Learning Tutor
              </button>
            </div>

            {/* Tab 1: Overview & Notes */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    {currentLesson.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    {currentLesson.description || 'In this lesson, you will master key implementation concepts, architecture tradeoffs, and step-by-step practices.'}
                  </p>

                  <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} color="var(--primary)" /> Core Takeaway:
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Always test edge cases and verify asynchronous state transitions in isolation before wiring into production flows.
                    </p>
                  </div>
                </div>

                {/* Personal Notepad */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Personal Lesson Notes</h4>
                    {notesSavedNotice && (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Saved!</span>
                    )}
                  </div>
                  <textarea
                    rows={6}
                    placeholder="Jot down notes, timestamp bookmarks, code snippets for this lesson..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ marginBottom: '0.75rem', fontSize: '0.88rem', resize: 'vertical' }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={handleSaveNotes}>
                    Save Notes
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Resources */}
            {activeTab === 'resources' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Downloadable Attachments & Links
                </h3>
                {(!currentLesson.resources || currentLesson.resources.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No downloadable attachments for this lesson.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 500 }}>
                    {currentLesson.resources.map((res, idx) => (
                      <div key={idx} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                          <FileText size={20} color="var(--primary)" />
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{res.name}</span>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.3rem 0.75rem' }}
                        >
                          <Download size={14} /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Discussion Q&A */}
            {activeTab === 'discussion' && (
              <div>
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Ask a Question about this Lesson
                  </h4>
                  <form onSubmit={handlePostDiscussion}>
                    <input
                      type="text"
                      placeholder="Title / Summary of your question..."
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                      required
                    />
                    <textarea
                      rows={2}
                      placeholder="Describe what you tried, what you expected, and where you are stuck..."
                      value={newQuestionMsg}
                      onChange={(e) => setNewQuestionMsg(e.target.value)}
                      style={{ marginBottom: '0.75rem' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      <Send size={14} /> Post Question
                    </button>
                  </form>
                </div>

                {/* Discussions list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {discussions.map((d) => (
                    <div key={d._id} className="card" style={{ padding: '1.25rem' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                        <div className="flex items-center gap-2">
                          <img
                            src={d.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                            alt={d.userName}
                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.userName}</span>
                          {d.userRole === 'instructor' && (
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Instructor</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleLikeDiscussion(d._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <ThumbsUp size={12} /> {d.likes || 0}
                        </button>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{d.title}</h4>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {d.message}
                      </p>

                      {/* Replies */}
                      {(d.replies || []).map((rep) => (
                        <div key={rep.id} style={{ marginLeft: '1.5rem', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rep.userName}</span>
                            {rep.userRole === 'instructor' && (
                              <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>Instructor</span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rep.message}</p>
                        </div>
                      ))}

                      {/* Reply form */}
                      <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
                        <input
                          type="text"
                          placeholder="Write a helpful answer..."
                          value={replyInput[d._id] || ''}
                          onChange={(e) => setReplyInput({ ...replyInput, [d._id]: e.target.value })}
                          style={{ height: 34, fontSize: '0.85rem' }}
                        />
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleReplyDiscussion(d._id)}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: AI Learning Assistant */}
            {activeTab === 'ai-tutor' && (
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 480 }}>
                <div className="flex items-center gap-2" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} color="#fff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>LearnHub AI Tutor</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>● Ready to help</span>
                  </div>
                </div>

                {/* Messages scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                  {aiChatMessages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        background: msg.sender === 'user' ? 'var(--primary-gradient)' : 'var(--bg-subtle)',
                        color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.text}
                      {msg.suggestions && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                setAiInput(sug);
                              }}
                              className="badge badge-primary"
                              style={{ cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                            >
                              💡 {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      AI Tutor is thinking...
                    </div>
                  )}
                </div>

                {/* Input row */}
                <form onSubmit={handleAiSend} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about this lesson, explain code, get quiz hints..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    style={{ height: 40 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={aiLoading || !aiInput.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Curriculum Lesson Sidebar */}
        <div style={{
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 65px)',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Course Content</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completedLessons.length} / {allLessons.length} lessons completed ({progressPercent}%)
            </span>
          </div>

          {/* Module & Lesson Items */}
          <div style={{ flex: 1, padding: '0.5rem 0' }}>
            {(course.modules || []).map((mod, modIdx) => (
              <div key={mod.id || modIdx} style={{ marginBottom: '0.75rem' }}>
                <div style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-subtle)'
                }}>
                  {mod.title}
                </div>

                <div>
                  {(mod.lessons || []).map((les) => {
                    const isSelected = currentLesson?.id === les.id;
                    const isDone = completedLessons.includes(les.id);
                    const mins = Math.floor((les.duration || 300) / 60);

                    return (
                      <div
                        key={les.id}
                        onClick={() => selectLesson(les, mod)}
                        style={{
                          padding: '0.75rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                          borderBottom: '1px solid var(--border-light)',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(les.id);
                            }}
                            style={{ color: isDone ? 'var(--success)' : 'var(--text-muted)' }}
                          >
                            {isDone ? <CheckCircle size={17} fill="var(--success)" color="#fff" /> : <Circle size={17} />}
                          </button>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)'
                          }}>
                            {les.title}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {mins}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Quiz & Certificate Shortcuts */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginBottom: '0.5rem' }}
              onClick={() => onOpenQuiz(course._id)}
            >
              <Award size={14} /> Course Knowledge Quiz
            </button>

            {progressPercent >= 100 && (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={() => onOpenCertificate(course._id)}
              >
                <Sparkles size={14} /> View Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
