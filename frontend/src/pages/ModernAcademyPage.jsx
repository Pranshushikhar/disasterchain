import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Flame,
  Award,
  CheckCircle,
  Search,
  Clock,
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Activity,
  Droplets,
  Wind,
  HeartPulse,
  Mountain,
  Sun,
  Zap,
  Car,
  HardHat,
  Compass,
  Briefcase,
  Users,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { ACADEMY_COURSES, ACADEMY_CATEGORIES, ACADEMY_ACHIEVEMENTS } from '../data/academyCourses';
import { academyService } from '../services/academyService';
import AcademyCertificateModal from '../components/AcademyCertificateModal';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';

export default function ModernAcademyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [progress, setProgress] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'simulations' | 'achievements'
  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const p = await academyService.getProgress();
      setProgress(p);
    }
    loadData();
  }, []);

  const totalCourses = ACADEMY_COURSES.length;
  const completedCoursesCount = progress?.completedCourses?.length || 0;
  const totalXp = progress?.totalXp || 0;
  const streakCount = progress?.streak?.count || 1;
  const earnedBadgesCount = progress?.badges?.length || 1;

  // Find in-progress course for Continue Learning section
  const inProgressCourse = (() => {
    if (!progress || !progress.completedLessons || progress.completedLessons.length === 0) {
      return ACADEMY_COURSES[0];
    }
    // Find first course with partially completed lessons
    const found = ACADEMY_COURSES.find((c) => {
      const isComplete = progress.completedCourses?.some((comp) => comp.courseId === c.id);
      const hasStarted = progress.completedLessons?.some((l) => l.courseId === c.id);
      return hasStarted && !isComplete;
    });
    return found || ACADEMY_COURSES[0];
  })();

  const filteredCourses = ACADEMY_COURSES.filter((course) => {
    const matchesCategory =
      selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCourseIcon = (id) => {
    switch (id) {
      case 'earthquake-safety':
        return <Activity size={20} className="dc-c-icon eq" />;
      case 'flood-safety':
        return <Droplets size={20} className="dc-c-icon fl" />;
      case 'fire-safety':
        return <Flame size={20} className="dc-c-icon fr" />;
      case 'cyclone-safety':
        return <Wind size={20} className="dc-c-icon cy" />;
      case 'landslide-safety':
        return <Mountain size={20} className="dc-c-icon ls" />;
      case 'heatwave-protection':
        return <Sun size={20} className="dc-c-icon hw" />;
      case 'lightning-safety':
        return <Zap size={20} className="dc-c-icon ln" />;
      case 'road-emergencies':
        return <Car size={20} className="dc-c-icon rd" />;
      case 'building-collapse':
        return <HardHat size={20} className="dc-c-icon bc" />;
      case 'first-aid-bls':
        return <HeartPulse size={20} className="dc-c-icon fa" />;
      case 'emergency-evacuation':
        return <Compass size={20} className="dc-c-icon ev" />;
      case 'emergency-kit':
        return <Briefcase size={20} className="dc-c-icon ek" />;
      case 'water-food-safety':
        return <Droplets size={20} className="dc-c-icon wf" />;
      case 'family-planning':
        return <Users size={20} className="dc-c-icon fp" />;
      case 'rescue-survival-basics':
        return <ShieldAlert size={20} className="dc-c-icon rs" />;
      default:
        return <BookOpen size={20} />;
    }
  };

  const handleOpenCertificate = (cert) => {
    setSelectedCert({
      userName: user?.name || 'Disaster Preparedness Scholar',
      courseTitle: cert.courseTitle || 'Disaster Safety Certification',
      certificateId: cert.certificateId,
      score: cert.score || 100,
      completedDate: new Date(cert.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });
    setIsCertModalOpen(true);
  };

  const handleAskTutorGeneric = () => {
    window.dispatchEvent(
      new CustomEvent('dc:aiAskPrompt', {
        detail: {
          prompt: 'Teach me the most important survival rule for disaster preparedness and quiz me.'
        }
      })
    );
    const voiceBtn = document.getElementById('dc-global-voice-assistant-btn');
    if (voiceBtn) voiceBtn.click();
  };

  return (
    <div className="dc-academy-dashboard-page">
      {/* 1. HERO LEARNING BANNER */}
      <section className="dc-academy-hero">
        <div className="dc-academy-hero-content">
          <div className="dc-hero-tag">
            <GraduationCap size={16} />
            <span>DISASTERCHAIN ACADEMY • CIVILIAN SURVIVAL ACADEMY</span>
          </div>

          <h1 className="dc-academy-hero-title">
            Learn How to Survive Any Disaster
          </h1>
          <p className="dc-academy-hero-subtitle">
            Master authoritative, evidence-based emergency response through interactive lessons,
            practical diagrams, decision simulations, and certified skill evaluations.
          </p>

          <div className="dc-academy-hero-actions">
            <Link to={`/academy/course/${inProgressCourse.id}`} className="dc-btn dc-btn-primary">
              <Play size={16} />
              <span>Continue Learning</span>
            </Link>
            <Link to="/academy/simulations" className="dc-btn dc-btn-outline">
              <ShieldAlert size={16} />
              <span>Interactive Simulations</span>
            </Link>
            <button
              type="button"
              onClick={handleAskTutorGeneric}
              className="dc-btn dc-btn-ghost dc-ai-tutor-trigger"
            >
              <Sparkles size={16} className="dc-sparkle-icon" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Gamification Stats HUD */}
        <div className="dc-academy-stats-hud">
          <div className="dc-hud-stat-card streak">
            <div className="dc-hud-icon-box">
              <Flame size={24} className="dc-flame-icon" />
            </div>
            <div className="dc-hud-info">
              <span className="dc-hud-value">{streakCount} Day{streakCount > 1 ? 's' : ''}</span>
              <span className="dc-hud-label">Daily Learning Streak</span>
            </div>
          </div>

          <div className="dc-hud-stat-card xp">
            <div className="dc-hud-icon-box">
              <Award size={24} className="dc-award-icon" />
            </div>
            <div className="dc-hud-info">
              <span className="dc-hud-value">{totalXp} XP</span>
              <span className="dc-hud-label">Total Learning Points</span>
            </div>
          </div>

          <div className="dc-hud-stat-card completed">
            <div className="dc-hud-icon-box">
              <CheckCircle size={24} className="dc-check-icon" />
            </div>
            <div className="dc-hud-info">
              <span className="dc-hud-value">{completedCoursesCount} / {totalCourses}</span>
              <span className="dc-hud-label">Courses Completed</span>
            </div>
          </div>

          <div className="dc-hud-stat-card badges">
            <div className="dc-hud-icon-box">
              <ShieldCheck size={24} className="dc-shield-icon" />
            </div>
            <div className="dc-hud-info">
              <span className="dc-hud-value">{earnedBadgesCount}</span>
              <span className="dc-hud-label">Badges Unlocked</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTINUE LEARNING SPOTLIGHT CARD */}
      {inProgressCourse && (
        <section className="dc-continue-learning-section">
          <div className="dc-spotlight-card">
            <div className="dc-spotlight-header">
              <span className="dc-spotlight-tag">CONTINUE LEARNING</span>
              <span className="dc-spotlight-category">{inProgressCourse.category.toUpperCase()}</span>
            </div>

            <div className="dc-spotlight-body">
              <div className="dc-spotlight-icon-col">
                {getCourseIcon(inProgressCourse.id)}
              </div>
              <div className="dc-spotlight-details">
                <h3 className="dc-spotlight-title">{inProgressCourse.title}</h3>
                <p className="dc-spotlight-desc">{inProgressCourse.description}</p>
                <div className="dc-spotlight-meta">
                  <span><Clock size={13} /> {inProgressCourse.duration}</span>
                  <span>•</span>
                  <span><Award size={13} /> +{inProgressCourse.points} XP</span>
                  <span>•</span>
                  <span>Badge: {inProgressCourse.badge.title}</span>
                </div>
              </div>
              <div className="dc-spotlight-action">
                <Link
                  to={`/academy/course/${inProgressCourse.id}`}
                  className="dc-btn dc-btn-primary dc-resume-btn"
                >
                  <span>Resume Course</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. TABS: COURSES | SIMULATIONS | ACHIEVEMENTS */}
      <section className="dc-academy-tabs-section">
        <div className="dc-tabs-nav-bar">
          <button
            onClick={() => setActiveTab('courses')}
            className={`dc-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Curriculum Courses ({totalCourses})</span>
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`dc-tab-btn ${activeTab === 'simulations' ? 'active' : ''}`}
          >
            <ShieldAlert size={16} />
            <span>Disaster Simulations</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`dc-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            <Award size={16} />
            <span>Badges & Credentials ({earnedBadgesCount})</span>
          </button>
        </div>

        {/* TAB 1: COURSES CATALOG */}
        {activeTab === 'courses' && (
          <div className="dc-courses-tab-view">
            {/* Filter & Search Bar */}
            <div className="dc-filter-search-row">
              <div className="dc-search-box">
                <Search size={18} className="dc-search-icon" />
                <input
                  type="text"
                  placeholder="Search 15 emergency courses (e.g. Earthquake, CPR, Water, Flood)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dc-search-input"
                />
              </div>

              <div className="dc-category-pills">
                {ACADEMY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`dc-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="dc-courses-grid">
              {filteredCourses.map((course) => {
                const isCompleted = progress?.completedCourses?.some(
                  (c) => c.courseId === course.id
                );
                const completedLessons =
                  course.lessons.filter((l) =>
                    progress?.completedLessons?.some(
                      (cl) => cl.courseId === course.id && cl.lessonId === l.id
                    )
                  ).length;
                const percent = Math.round(
                  (completedLessons / course.lessons.length) * 100
                );

                return (
                  <div key={course.id} className={`dc-course-card ${isCompleted ? 'is-complete' : ''}`}>
                    <div className="dc-course-card-top">
                      <div className="dc-course-badge-box">
                        {getCourseIcon(course.id)}
                        <span className="dc-course-category-tag">
                          {course.category.toUpperCase()}
                        </span>
                      </div>
                      <span className="dc-course-duration">
                        <Clock size={13} />
                        {course.duration}
                      </span>
                    </div>

                    <h3 className="dc-course-card-title">{course.title}</h3>
                    <p className="dc-course-card-desc">{course.description}</p>

                    <div className="dc-course-card-progress">
                      <div className="dc-progress-labels-compact">
                        <span>{completedLessons} / {course.lessons.length} Lessons</span>
                        <span>{isCompleted ? '100% Completed' : `${percent}%`}</span>
                      </div>
                      <div className="dc-progress-track-compact">
                        <div
                          className={`dc-progress-fill-compact ${isCompleted ? 'complete' : ''}`}
                          style={{ width: isCompleted ? '100%' : `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="dc-course-card-footer">
                      <div className="dc-course-points-tag">
                        <Award size={14} />
                        <span>+{course.points} XP</span>
                      </div>

                      <Link
                        to={`/academy/course/${course.id}`}
                        className={`dc-btn ${isCompleted ? 'dc-btn-outline' : 'dc-btn-primary'} dc-course-action-btn`}
                      >
                        {isCompleted ? 'Review Course' : completedLessons > 0 ? 'Continue' : 'Start Course'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATIONS SHOWCASE */}
        {activeTab === 'simulations' && (
          <div className="dc-simulations-tab-view">
            <div className="dc-sim-banner">
              <div>
                <h2>Interactive Scenario Branching Simulator</h2>
                <p>Test your survival instincts under pressure with consequence-driven choices.</p>
              </div>
              <Link to="/academy/simulations" className="dc-btn dc-btn-primary">
                <Play size={16} />
                <span>Launch Full Simulator</span>
              </Link>
            </div>

            <div className="dc-sim-cards-grid">
              <div className="dc-sim-promo-card">
                <Activity size={28} className="dc-promo-icon" />
                <h3>Earthquake in a Multi-Story Office</h3>
                <p>Trapped on the 7th floor when violent seismic shaking begins. Avoid elevator death traps and gas line explosions.</p>
                <Link to="/academy/simulations" className="dc-btn dc-btn-outline">Start Scenario</Link>
              </div>

              <div className="dc-sim-promo-card">
                <Droplets size={28} className="dc-promo-icon" />
                <h3>Flash Flood Approaching Your Vehicle</h3>
                <p>A cloudburst sweeps muddy water over a roadway dip. Learn how fast 12 inches of water sweeps away an SUV.</p>
                <Link to="/academy/simulations" className="dc-btn dc-btn-outline">Start Scenario</Link>
              </div>

              <div className="dc-sim-promo-card">
                <Flame size={28} className="dc-promo-icon" />
                <h3>Nighttime Residential Fire & Smoke Escape</h3>
                <p>Smoke alarm wakes you at 2:30 AM. Test hot doors, crawl under thermal toxic smoke, and formulate secondary egress.</p>
                <Link to="/academy/simulations" className="dc-btn dc-btn-outline">Start Scenario</Link>
              </div>

              <div className="dc-sim-promo-card">
                <Wind size={28} className="dc-promo-icon" />
                <h3>Severe Cyclone Landfall: 12-Hour Alert</h3>
                <p>Category 4 cyclone approaching. Shutter property properly, avoid the calm eye-of-the-storm trap, and run generators safely.</p>
                <Link to="/academy/simulations" className="dc-btn dc-btn-outline">Start Scenario</Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS & CERTIFICATES */}
        {activeTab === 'achievements' && (
          <div className="dc-achievements-tab-view">
            {/* Certificates Earned */}
            <div className="dc-earned-certs-block">
              <h3 className="dc-block-heading">
                <FileText size={18} />
                <span>Earned Completion Credentials</span>
              </h3>

              {progress?.completedCourses && progress.completedCourses.length > 0 ? (
                <div className="dc-certs-grid">
                  {progress.completedCourses.map((cert) => {
                    const cData = ACADEMY_COURSES.find((c) => c.id === cert.courseId);
                    return (
                      <div key={cert.courseId} className="dc-cert-card">
                        <div className="dc-cert-card-seal">
                          <GraduationCap size={24} />
                        </div>
                        <div className="dc-cert-card-info">
                          <h4 className="dc-cert-card-title">{cData?.title || cert.courseId}</h4>
                          <span className="dc-cert-card-id">ID: {cert.certificateId || 'Verified'}</span>
                          <span className="dc-cert-card-score">Score: {cert.score}%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCertificate({
                              ...cert,
                              courseTitle: cData?.title || cert.courseId
                            })
                          }
                          className="dc-btn dc-btn-outline dc-view-cert-btn"
                        >
                          View Certificate
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="dc-empty-certs-card">
                  <Award size={32} />
                  <p>No certificates earned yet. Complete any course with an 80%+ quiz score to earn your verified credential!</p>
                </div>
              )}
            </div>

            {/* Badges Grid */}
            <div className="dc-badges-block">
              <h3 className="dc-block-heading">
                <Award size={18} />
                <span>All Achievement Badges</span>
              </h3>
              <div className="dc-badges-grid">
                {ACADEMY_ACHIEVEMENTS.map((badge) => {
                  const unlocked = progress?.badges?.includes(badge.id);
                  return (
                    <div key={badge.id} className={`dc-badge-item ${unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="dc-badge-icon-box">
                        <Award size={24} />
                      </div>
                      <h4 className="dc-badge-title">{badge.title}</h4>
                      <p className="dc-badge-desc">{badge.description}</p>
                      <span className="dc-badge-status-tag">
                        {unlocked ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Certificate Modal */}
      <AcademyCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificateData={selectedCert}
      />
    </div>
  );
}
