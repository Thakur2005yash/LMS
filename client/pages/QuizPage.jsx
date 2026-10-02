import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function QuizPage({
  courseId,
  user,
  onBackToCourse,
  onOpenCertificate
}) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, [courseId]);

  const loadQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentQIndex(0);
    try {
      const res = await api.getQuiz(courseId);
      if (res.success) {
        setQuiz(res.quiz);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId, answerVal) => {
    setAnswers({ ...answers, [qId]: answerVal });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(courseId, answers);
      if (res.success) {
        setResult(res.result);
        if (res.result.passed) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 }
          });
        }
      }
    } catch (err) {
      alert(err.message || 'Error submitting quiz answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading assessment questions...
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>No Quiz Available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          An assessment has not been configured for this course yet.
        </p>
        <button className="btn btn-primary" onClick={onBackToCourse}>
          Return to Course
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQIndex];
  const totalQ = quiz.questions.length;
  const isLastQuestion = currentQIndex === totalQ - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container" style={{ maxWidth: 800, padding: '3rem 1.5rem 6rem' }}>
      {/* Quiz Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBackToCourse}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ChevronLeft size={16} /> Back to Course
        </button>

        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{quiz.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {quiz.description}
            </p>
          </div>

          <div className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            Passing Score: {quiz.passingScore}%
          </div>
        </div>
      </div>

      {/* QUIZ RESULTS VIEW */}
      {result ? (
        <div className="card glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: result.passed ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: result.passed ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            {result.passed ? <CheckCircle size={40} /> : <XCircle size={40} />}
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {result.passed ? '🎉 Congratulations! You Passed!' : 'Almost There! Keep Practicing'}
          </h2>

          <div style={{ fontSize: '3rem', fontWeight: 800, color: result.passed ? 'var(--success)' : 'var(--danger)', margin: '1rem 0' }}>
            {result.score}%
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            You answered <strong>{result.correctCount}</strong> out of <strong>{result.totalQuestions}</strong> questions correctly.
            {result.passed ? ' Your mastery has been recorded in your course progress!' : ' You need at least 70% to pass.'}
          </p>

          <div className="flex justify-center gap-4" style={{ marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={loadQuiz}>
              <RotateCcw size={16} /> Retake Quiz
            </button>
            {result.passed ? (
              <button className="btn btn-primary" onClick={() => onOpenCertificate(courseId)}>
                <Sparkles size={16} /> Claim Certificate of Completion
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onBackToCourse}>
                Review Lesson Materials
              </button>
            )}
          </div>

          {/* Detailed Question Review */}
          <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Detailed Answer Feedback
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {result.feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: `4px solid ${item.isCorrect ? 'var(--success)' : 'var(--danger)'}`
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Question {idx + 1}
                    </span>
                    <span className={`badge ${item.isCorrect ? 'badge-success' : 'badge-danger'}`}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    {item.questionText}
                  </p>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <strong>Your Answer: </strong>
                    <span style={{ color: item.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                      {String(item.studentAnswer || 'No answer submitted')}
                    </span>
                  </div>

                  {!item.isCorrect && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                      <strong>Correct Answer: </strong> {String(item.correctAnswer)}
                    </div>
                  )}

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    💡 <strong>Explanation: </strong> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE QUESTION VIEW */
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          {/* Progress Tracker Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                Question {currentQIndex + 1} of {totalQ}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {answeredCount} of {totalQ} Answered
              </span>
            </div>
            <div className="progress-bar-container" style={{ height: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${((currentQIndex + 1) / totalQ) * 100}%` }} />
            </div>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="badge badge-primary" style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>
              {currentQ.type ? currentQ.type.replace(/_/g, ' ') : 'Multiple Choice'}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.4 }}>
              {currentQ.questionText}
            </h2>
          </div>

          {/* Answer Inputs based on Question Type */}
          <div style={{ marginBottom: '2.5rem' }}>
            {/* Multiple Choice & True/False */}
            {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false' || !currentQ.type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(currentQ.options || ['Option A', 'Option B']).map((opt, oIdx) => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectAnswer(currentQ.id, opt)}
                      className="card"
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)'
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? '6px solid var(--primary)' : '2px solid var(--text-muted)',
                        background: '#fff'
                      }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 700 : 500 }}>
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fill In The Blank */}
            {currentQ.type === 'fill_in_blank' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Type your answer in the box below:
                </label>
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  style={{ height: 48, fontSize: '1rem', maxWidth: 400 }}
                />
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button
              className="btn btn-secondary"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Grading Assessment...' : 'Submit Final Answers'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQIndex(prev => Math.min(totalQ - 1, prev + 1))}
              >
                Next Question <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
