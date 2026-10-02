import { GraduationCap, Heart, ShieldCheck, Zap } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setActivePage('home')}>
              <div style={{
                background: 'var(--primary-gradient)',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                LearnHub
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The modern online learning platform empowering curious minds to build real-world software, AI, and design systems.
            </p>
            <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
              <span className="badge badge-success">
                <ShieldCheck size={12} /> Verifiable Certificates
              </span>
              <span className="badge badge-primary">
                <Zap size={12} /> AI Tutor Inside
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li><a href="#courses" onClick={(e) => { e.preventDefault(); setActivePage('courses'); }}>Browse All Courses</a></li>
              <li><a href="#live" onClick={(e) => { e.preventDefault(); setActivePage('live-classes'); }}>Live Masterclasses</a></li>
              <li><a href="#leaderboard" onClick={(e) => { e.preventDefault(); setActivePage('leaderboard'); }}>Student Leaderboard</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Curriculum Tracks</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li>Full-Stack Web Development</li>
              <li>Python, Data Science & AI</li>
              <li>UI/UX Design & Figma Systems</li>
              <li>Cloud & DevOps Pipelines</li>
            </ul>
          </div>

          {/* Tech Stack Info */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Platform Specs</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Built with React 19, Node.js, Express, HTTP 206 Video Streaming, and PDFKit.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-secondary">React 19</span>
              <span className="badge badge-secondary">Node.js</span>
              <span className="badge badge-secondary">Express</span>
              <span className="badge badge-secondary">JWT</span>
              <span className="badge badge-secondary">PDFKit</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} LearnHub LMS Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with <Heart size={14} color="var(--danger)" fill="var(--danger)" /> for recruiters & global learners.
          </div>
        </div>
      </div>
    </footer>
  );
}
