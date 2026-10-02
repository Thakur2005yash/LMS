import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  Copy,
  ChevronLeft,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { api } from '../services/api';

export default function CertificatePage({
  courseId,
  user,
  onBackToCourse,
  setActivePage
}) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCertificate();
  }, [courseId]);

  const loadCertificate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getCertificate(courseId);
      if (res.success) {
        setCert(res.certificate);
      }
    } catch (err) {
      setError(err.message || 'You must complete 100% of the lessons to earn this certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    const url = api.downloadCertificateUrl(courseId);
    window.open(url, '_blank');
  };

  const handleCopyVerification = () => {
    if (!cert) return;
    const fullUrl = `${window.location.origin}/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating your official verified credentials...
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="container" style={{ maxWidth: 600, padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="card glass-panel" style={{ padding: '3rem 2rem' }}>
          <Award size={48} color="var(--warning)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Certificate Locked
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error || 'Finish all modules and pass the course assessment to unlock your official credential.'}
          </p>
          <button className="btn btn-primary" onClick={onBackToCourse}>
            Back to Course Lessons
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(cert.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container" style={{ maxWidth: 960, padding: '3rem 1.5rem 6rem' }}>
      {/* Action Bar */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={onBackToCourse}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ChevronLeft size={16} /> Return to Course
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyVerification}
            className="btn btn-secondary btn-sm"
          >
            {copied ? <CheckCircle size={14} color="var(--success)" /> : <Copy size={14} />}
            {copied ? 'Link Copied!' : 'Copy Verification Link'}
          </button>

          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={handleDownloadPdf}
            className="btn btn-primary btn-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            <Download size={14} /> Download Official PDF
          </button>
        </div>
      </div>

      {/* CERTIFICATE DISPLAY CANVAS (Landscape A4 ratio) */}
      <div
        id="certificate-print-area"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '3.5rem 3rem',
          position: 'relative',
          border: '12px solid #0f172a',
          outline: '3px solid #d97706',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Decorative corner gold accents */}
        <div style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: '2px solid #d97706', borderLeft: '2px solid #d97706' }} />
        <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: '2px solid #d97706', borderRight: '2px solid #d97706' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: '2px solid #d97706', borderLeft: '2px solid #d97706' }} />
        <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: '2px solid #d97706', borderRight: '2px solid #d97706' }} />

        {/* Header Ribbon */}
        <div style={{
          fontSize: '0.85rem',
          letterSpacing: '0.3em',
          fontWeight: 800,
          color: '#4f46e5',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          LEARNHUB ONLINE ACADEMY
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
          fontFamily: 'serif',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '0.04em',
          marginBottom: '0.5rem'
        }}>
          CERTIFICATE OF COMPLETION
        </h1>

        <div style={{
          fontSize: '0.95rem',
          letterSpacing: '0.2em',
          color: '#64748b',
          textTransform: 'uppercase',
          margin: '1.25rem 0 1rem'
        }}>
          THIS CERTIFIES THAT
        </div>

        {/* Student Name */}
        <div style={{
          fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
          fontWeight: 800,
          fontFamily: 'serif',
          color: '#1e293b',
          borderBottom: '2px solid #e2e8f0',
          display: 'inline-block',
          paddingBottom: '0.25rem',
          marginBottom: '1.25rem'
        }}>
          {cert.userName}
        </div>

        <p style={{
          fontSize: '0.95rem',
          color: '#475569',
          maxWidth: 600,
          margin: '0 auto 1.5rem',
          lineHeight: 1.6
        }}>
          has successfully fulfilled all curriculum requirements, hands-on lab assignments, and the final assessment for the online course:
        </p>

        {/* Course Title */}
        <div style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '2.5rem'
        }}>
          "{cert.courseTitle}"
        </div>

        {/* Bottom Signatures & Seal Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'center',
          marginTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.5rem'
        }}>
          {/* Left: Instructor signature */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.35rem', color: '#1e293b', marginBottom: '0.25rem' }}>
              {cert.instructorName}
            </div>
            <div style={{ borderTop: '1px solid #94a3b8', width: '80%', margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{cert.instructorName}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Course Lead Instructor</div>
          </div>

          {/* Center: Gold Verified Seal */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fef3c7 0%, #fde68a 60%, #d97706 100%)',
              border: '3px solid #b45309',
              margin: '0 auto 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
            }}>
              <Award size={24} color="#78350f" />
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em' }}>VERIFIED</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              {cert.certificateId}
            </div>
          </div>

          {/* Right: Date of conferment */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
              {formattedDate}
            </div>
            <div style={{ borderTop: '1px solid #94a3b8', width: '80%', margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Date Issued</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Platform Registry</div>
          </div>
        </div>
      </div>
    </div>
  );
}
