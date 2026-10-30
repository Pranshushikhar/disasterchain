import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ACADEMY_COURSES } from '../data/academyCourses';
import { academyService } from '../services/academyService';
import AcademyDiagram from '../components/AcademyDiagram';
import AcademyCertificateModal from '../components/AcademyCertificateModal';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';

export default function AcademyCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [course, setCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [isQuizMode, setIsQuizMode] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('quiz')
  );

  // Checkpoint question state for current lesson
  const [checkpointSelected, setCheckpointSelected] = useState(null);
  const [checkpointSubmitted, setCheckpointSubmitted] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    const found = ACADEMY_COURSES.find((c) => c.id === courseId);
    if (found) {
      setCourse(found);
    } else {
      navigate('/academy');
    }
  }, [courseId, navigate]);

  useEffect(() => {
    async function loadProgress() {
      const p = await academyService.getProgress();
      setProgress(p);
    }
    loadProgress();
  }, []);

  // Reset lesson checkpoint state when switching lessons
  useEffect(() => {
    setCheckpointSelected(null);
    setCheckpointSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLessonIndex, isQuizMode]);

  if (!course) {
    return (
      <div className="dc-page-loading">
        <div className="dc-spinner" />
        <p>Loading course curriculum...</p>
      </div>
    );
  }

  const currentLesson = course.lessons[activeLessonIndex];
  const isLessonCompleted = (lessonId) =>
    progress?.completedLessons?.some(
      (l) => l.courseId === course.id && l.lessonId === lessonId
    );

  const completedLessonsCount =
    course.lessons.filter((l) => isLessonCompleted(l.id)).length;
  const progressPercent = Math.round(
    (completedLessonsCount / course.lessons.length) * 100
  );

  const handleCompleteCurrentLesson = async () => {
    if (currentLesson) {
      const updated = await academyService.completeLesson(course.id, currentLesson.id);
      setProgress(updated);
    }
    if (activeLessonIndex < course.lessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
    } else {
      setIsQuizMode(true);
    }
  };

  const handleCheckpointSubmit = () => {
    if (checkpointSelected !== null) {
      setCheckpointSubmitted(true);
    }
  };

  const handleQuizOptionSelect = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleQuizSubmit = async () => {
    let correctCount = 0;
    course.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / course.quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    const res = await academyService.submitQuiz(course.id, score, course.badge.id);
    if (res.progress) setProgress(res.progress);

    if (res.passed) {
      setCertData({
        userName: user?.name || 'Disaster Preparedness Scholar',
        courseTitle: course.title,
        certificateId: res.certificateId,
        score,
        completedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleAskAiTutor = () => {
    const promptText = `Explain the following lesson on "${course.title} - ${currentLesson?.title}" in simple words and give me a practical safety tip.`;
    window.dispatchEvent(
      new CustomEvent('dc:aiAskPrompt', {
        detail: {
          prompt: promptText,
          courseId: course.id,
          lessonId: currentLesson?.id,
          lessonTitle: currentLesson?.title
        }
      })
    );
    const voiceBtn = document.getElementById('dc-global-voice-assistant-btn');
    if (voiceBtn) voiceBtn.click();
  };

  return (
    <div className="dc-academy-course-page">
      {/* Top Breadcrumb Header */}
      <header className="dc-course-header">
        <div className="dc-course-header-top">
          <Link to="/academy" className="dc-back-link">
            <ArrowLeft size={16} />
            <span>Back to Academy</span>
          </Link>
          <div className="dc-course-meta-tags">
            <span className="dc-tag-category">{course.category.toUpperCase()}</span>
            <span className="dc-tag-duration">
              <Clock size={13} />
              <span>{course.duration}</span>
            </span>
            <span className="dc-tag-points">
              <Award size={13} />
              <span>+{course.points} XP</span>
            </span>
          </div>
        </div>

        <h1 className="dc-course-headline">{course.title}</h1>
        <p className="dc-course-description">{course.description}</p>

        {/* Progress Bar */}
        <div className="dc-course-progress-bar-wrapper">
          <div className="dc-progress-labels">
            <span>Course Progress</span>
            <span>{completedLessonsCount} / {course.lessons.length} Lessons ({progressPercent}%)</span>
          </div>
          <div className="dc-progress-track">
            <div
              className="dc-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Learning Grid: Sidebar + Viewport */}
      <div className="dc-course-workspace">
        {/* Left Navigation: Lesson List */}
        <aside className="dc-course-sidebar" aria-label="Course Syllabus">
          <div className="dc-sidebar-title-row">
            <BookOpen size={16} />
            <span>Course Curriculum</span>
          </div>

          <div className="dc-lessons-nav-list">
            {course.lessons.map((lesson, idx) => {
              const active = !isQuizMode && activeLessonIndex === idx;
              const done = isLessonCompleted(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setIsQuizMode(false);
                    setActiveLessonIndex(idx);
                  }}
                  className={`dc-lesson-nav-item ${active ? 'active' : ''} ${done ? 'completed' : ''}`}
                >
                  <div className="dc-lesson-nav-indicator">
                    {done ? (
                      <CheckCircle size={15} className="dc-done-icon" />
                    ) : (
                      <span className="dc-lesson-nav-num">{idx + 1}</span>
                    )}
                  </div>
                  <div className="dc-lesson-nav-text">
                    <span className="dc-lesson-nav-title">{lesson.title}</span>
                    <span className="dc-lesson-nav-dur">{lesson.duration}</span>
                  </div>
                </button>
              );
            })}

            {/* Final Quiz Nav Item */}
            <button
              onClick={() => setIsQuizMode(true)}
              className={`dc-lesson-nav-item dc-quiz-nav-item ${isQuizMode ? 'active' : ''}`}
            >
              <div className="dc-lesson-nav-indicator">
                <Award size={16} />
              </div>
              <div className="dc-lesson-nav-text">
                <span className="dc-lesson-nav-title">Knowledge Assessment</span>
                <span className="dc-lesson-nav-dur">Final Exam • 4 Questions</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Right Viewport: Lesson Viewer or Quiz */}
        <main className="dc-course-content-viewer">
          {!isQuizMode ? (
            /* LESSON VIEW */
            <article className="dc-lesson-article">
              <div className="dc-lesson-header-meta">
                <span className="dc-lesson-crumb">
                  Lesson {activeLessonIndex + 1} of {course.lessons.length}
                </span>
                <button
                  type="button"
                  onClick={handleAskAiTutor}
                  className="dc-ai-tutor-quick-btn"
                  title="Ask DisasterChain AI Tutor about this lesson"
                >
                  <Sparkles size={15} className="dc-sparkle-icon" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>

              <h2 className="dc-lesson-headline">{currentLesson.title}</h2>

              {/* Lesson Text */}
              <div className="dc-lesson-body-text">
                {currentLesson.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Interactive Safety Diagram */}
              {currentLesson.diagram && (
                <AcademyDiagram diagram={currentLesson.diagram} />
              )}

              {/* Practical Checklist Steps */}
              {currentLesson.practicalSteps && (
                <div className="dc-practical-steps-box">
                  <h3 className="dc-steps-title">
                    <ShieldCheck size={18} />
                    <span>Practical Safety Protocol Checklist</span>
                  </h3>
                  <ul className="dc-steps-list">
                    {currentLesson.practicalSteps.map((step, sIdx) => (
                      <li key={sIdx} className="dc-step-item">
                        <span className="dc-step-num">{sIdx + 1}</span>
                        <span className="dc-step-text">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Knowledge Checkpoint Question */}
              {currentLesson.checkpoint && (
                <div className="dc-checkpoint-box">
                  <div className="dc-checkpoint-header">
                    <HelpCircle size={18} className="dc-checkpoint-icon" />
                    <span>Knowledge Checkpoint</span>
                  </div>
                  <h4 className="dc-checkpoint-question">
                    {currentLesson.checkpoint.question}
                  </h4>

                  <div className="dc-checkpoint-options">
                    {currentLesson.checkpoint.options.map((opt, oIdx) => {
                      const isSelected = checkpointSelected === oIdx;
                      const isCorrect = oIdx === currentLesson.checkpoint.correctAnswerIndex;
                      let statusClass = '';

                      if (checkpointSubmitted) {
                        if (isCorrect) statusClass = 'correct';
                        else if (isSelected && !isCorrect) statusClass = 'incorrect';
                      } else if (isSelected) {
                        statusClass = 'selected';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={checkpointSubmitted}
                          onClick={() => setCheckpointSelected(oIdx)}
                          className={`dc-checkpoint-option ${statusClass}`}
                        >
                          <span className="dc-opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                          <span className="dc-opt-label">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!checkpointSubmitted ? (
                    <button
                      type="button"
                      disabled={checkpointSelected === null}
                      onClick={handleCheckpointSubmit}
                      className="dc-btn dc-btn-primary dc-checkpoint-submit-btn"
                    >
                      Check Understanding
                    </button>
                  ) : (
                    <div
                      className={`dc-checkpoint-feedback ${
                        checkpointSelected === currentLesson.checkpoint.correctAnswerIndex
                          ? 'success'
                          : 'error'
                      }`}
                    >
                      <div className="dc-feedback-head">
                        {checkpointSelected === currentLesson.checkpoint.correctAnswerIndex ? (
                          <>
                            <CheckCircle size={18} />
                            <span>Correct! Excellent safety instinct.</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={18} />
                            <span>Unsafe choice. Review the explanation:</span>
                          </>
                        )}
                      </div>
                      <p className="dc-feedback-explanation">
                        {currentLesson.checkpoint.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Footer Navigation */}
              <div className="dc-lesson-action-footer">
                <button
                  type="button"
                  disabled={activeLessonIndex === 0}
                  onClick={() => setActiveLessonIndex((prev) => prev - 1)}
                  className="dc-btn dc-btn-secondary"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteCurrentLesson}
                  className="dc-btn dc-btn-primary dc-complete-next-btn"
                >
                  <span>
                    {activeLessonIndex === course.lessons.length - 1
                      ? 'Proceed to Final Exam'
                      : 'Mark Complete & Next Lesson'}
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ) : (
            /* END-OF-COURSE QUIZ VIEW */
            <div className="dc-quiz-view">
              <div className="dc-quiz-header">
                <Award size={28} className="dc-quiz-award-icon" />
                <div>
                  <h2 className="dc-quiz-title">Knowledge Assessment: {course.title}</h2>
                  <p className="dc-quiz-sub">
                    Answer all 4 questions. Score 80% or higher to earn your course achievement badge and verified completion certificate.
                  </p>
                </div>
              </div>

              {!quizSubmitted ? (
                /* QUIZ QUESTIONS FORM */
                <div className="dc-quiz-questions-list">
                  {course.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="dc-quiz-card">
                      <div className="dc-quiz-num">Question {qIdx + 1} of {course.quiz.length}</div>
                      <h3 className="dc-quiz-q-text">{q.question}</h3>
                      <div className="dc-quiz-options-grid">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleQuizOptionSelect(qIdx, oIdx)}
                              className={`dc-quiz-opt-btn ${isSelected ? 'selected' : ''}`}
                            >
                              <span className="dc-quiz-opt-marker">{String.fromCharCode(65 + oIdx)}</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="dc-quiz-footer-actions">
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length < course.quiz.length}
                      onClick={handleQuizSubmit}
                      className="dc-btn dc-btn-primary dc-btn-large"
                    >
                      Submit Exam for Evaluation
                    </button>
                  </div>
                </div>
              ) : (
                /* QUIZ RESULT REPORT */
                <div className="dc-quiz-result-report">
                  <div className={`dc-result-hero ${quizScore >= 80 ? 'passed' : 'failed'}`}>
                    <div className="dc-result-score-circle">
                      <span className="dc-score-num">{quizScore}%</span>
                      <span className="dc-score-label">Score</span>
                    </div>

                    <div className="dc-result-summary">
                      <h3 className="dc-result-heading">
                        {quizScore >= 80
                          ? 'Congratulations! You Passed the Exam.'
                          : 'Score Below Passing Threshold (80%)'}
                      </h3>
                      <p className="dc-result-desc">
                        {quizScore >= 80
                          ? `You demonstrated verified proficiency in ${course.title}. Your achievement badge is unlocked!`
                          : 'Review the lessons and safety explanations below, then retake the assessment.'}
                      </p>

                      <div className="dc-result-cta-row">
                        {quizScore >= 80 ? (
                          <button
                            type="button"
                            onClick={() => setIsCertModalOpen(true)}
                            className="dc-btn dc-btn-primary"
                          >
                            <FileText size={16} />
                            <span>View Completion Certificate</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRetakeQuiz}
                            className="dc-btn dc-btn-primary"
                          >
                            <RotateCcw size={16} />
                            <span>Retake Assessment</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsQuizMode(false);
                            setActiveLessonIndex(0);
                          }}
                          className="dc-btn dc-btn-secondary"
                        >
                          Review Course Lessons
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Question Review Breakdown */}
                  <div className="dc-quiz-review-section">
                    <h4 className="dc-review-title">Detailed Answers & Safety Rationales</h4>
                    {course.quiz.map((q, qIdx) => {
                      const userChoice = quizAnswers[qIdx];
                      const isCorrect = userChoice === q.correctAnswerIndex;

                      return (
                        <div
                          key={qIdx}
                          className={`dc-review-card ${isCorrect ? 'correct' : 'incorrect'}`}
                        >
                          <div className="dc-review-q-header">
                            <span className="dc-review-badge">Question {qIdx + 1}</span>
                            {isCorrect ? (
                              <span className="dc-status-pill success">
                                <CheckCircle size={14} /> Correct
                              </span>
                            ) : (
                              <span className="dc-status-pill danger">
                                <AlertTriangle size={14} /> Incorrect
                              </span>
                            )}
                          </div>
                          <p className="dc-review-question">{q.question}</p>
                          <div className="dc-review-choices">
                            <p className="dc-review-your-answer">
                              <strong>Your Answer:</strong> {q.options[userChoice] || 'No answer'}
                            </p>
                            {!isCorrect && (
                              <p className="dc-review-correct-answer">
                                <strong>Correct Protocol:</strong> {q.options[q.correctAnswerIndex]}
                              </p>
                            )}
                          </div>
                          <p className="dc-review-rationale">
                            <strong>Safety Rationale:</strong> {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Completion Certificate Modal */}
      <AcademyCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificateData={certData}
      />
    </div>
  );
}
