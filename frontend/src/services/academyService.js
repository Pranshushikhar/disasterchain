/**
 * DisasterChain Academy Client Service
 * Coordinates backend API synchronization with local storage fallback for guest users.
 */

import axios from 'axios';
import { ACADEMY_COURSES, ACADEMY_ACHIEVEMENTS } from '../data/academyCourses';

const API_BASE = process.env.REACT_APP_API_URL || '';
const GUEST_STORAGE_KEY = 'disasterchain_academy_progress_guest';
const GUEST_ID_KEY = 'disasterchain_academy_guest_id';

function getGuestId() {
  try {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = `guest-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'guest-learner';
  }
}

function getLocalProgress() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    userId: getGuestId(),
    totalXp: 0,
    streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
    badges: ['badge-first-lesson'],
    completedCourses: [],
    completedLessons: [],
    quizAttempts: []
  };
}

function saveLocalProgress(progress) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

export const academyService = {
  getGuestId,
  
  /**
   * Fetch user or guest learning progress
   */
  async getProgress() {
    try {
      const token = localStorage.getItem('token');
      const guestId = getGuestId();
      const headers = { 'x-guest-user-id': guestId };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get(`${API_BASE}/api/academy/progress?userId=${guestId}`, { headers });
      if (res.data?.success && res.data.progress) {
        saveLocalProgress(res.data.progress);
        return res.data.progress;
      }
    } catch (err) {
      console.warn('[AcademyService] Network error fetching progress, falling back to local cache:', err.message);
    }

    return getLocalProgress();
  },

  /**
   * Mark a lesson completed and earn XP
   */
  async completeLesson(courseId, lessonId) {
    const local = getLocalProgress();
    const alreadyDone = local.completedLessons.some(
      (l) => l.courseId === courseId && l.lessonId === lessonId
    );

    if (!alreadyDone) {
      local.completedLessons.push({ courseId, lessonId, completedAt: new Date().toISOString() });
      local.totalXp += 25;
      saveLocalProgress(local);
    }

    try {
      const token = localStorage.getItem('token');
      const guestId = getGuestId();
      const headers = { 'x-guest-user-id': guestId };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.post(
        `${API_BASE}/api/academy/lesson-complete`,
        { courseId, lessonId, userId: guestId },
        { headers }
      );
      if (res.data?.success && res.data.progress) {
        saveLocalProgress(res.data.progress);
        return res.data.progress;
      }
    } catch (err) {
      console.warn('[AcademyService] Failed to sync lesson to server:', err.message);
    }

    return local;
  },

  /**
   * Submit end-of-course quiz and generate certificate
   */
  async submitQuiz(courseId, score, badgeId) {
    const local = getLocalProgress();
    const passed = score >= 80;
    const certId = passed
      ? `DC-CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : null;

    local.quizAttempts.push({
      courseId,
      score,
      passed,
      completedAt: new Date().toISOString()
    });

    if (score === 100 && !local.badges.includes('badge-quiz-ace')) {
      local.badges.push('badge-quiz-ace');
    }

    if (passed) {
      const existing = local.completedCourses.find((c) => c.courseId === courseId);
      if (existing) {
        existing.score = Math.max(existing.score, score);
      } else {
        local.completedCourses.push({
          courseId,
          score,
          completedAt: new Date().toISOString(),
          badgeAwarded: badgeId || null,
          certificateId: certId
        });
        local.totalXp += 100;
      }

      if (badgeId && !local.badges.includes(badgeId)) {
        local.badges.push(badgeId);
      }

      if (local.completedCourses.length >= 10 && !local.badges.includes('badge-academy-graduate')) {
        local.badges.push('badge-academy-graduate');
      }
    }

    saveLocalProgress(local);

    try {
      const token = localStorage.getItem('token');
      const guestId = getGuestId();
      const headers = { 'x-guest-user-id': guestId };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.post(
        `${API_BASE}/api/academy/quiz-submit`,
        { courseId, score, badgeId, userId: guestId },
        { headers }
      );
      if (res.data?.success && res.data.progress) {
        saveLocalProgress(res.data.progress);
        return {
          passed: res.data.passed,
          score: res.data.score,
          certificateId: res.data.certificateId || certId,
          progress: res.data.progress
        };
      }
    } catch (err) {
      console.warn('[AcademyService] Failed to sync quiz to server:', err.message);
    }

    return {
      passed,
      score,
      certificateId: certId,
      progress: local
    };
  },

  /**
   * Look up course by ID
   */
  getCourseById(courseId) {
    return ACADEMY_COURSES.find((c) => c.id === courseId) || null;
  },

  /**
   * Get all achievements metadata
   */
  getAchievements() {
    return ACADEMY_ACHIEVEMENTS;
  }
};
