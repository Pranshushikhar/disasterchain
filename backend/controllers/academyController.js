const mongoose = require('mongoose');
const AcademyProgress = require('../models/AcademyProgress');
const memoryStore = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to calculate daily learning streak
 */
function updateStreak(currentStreak) {
  const today = new Date().toISOString().split('T')[0];
  if (!currentStreak || !currentStreak.lastActiveDate) {
    return { count: 1, lastActiveDate: today };
  }

  const lastDate = new Date(currentStreak.lastActiveDate);
  const now = new Date(today);
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today; streak count stays same
    return currentStreak;
  } else if (diffDays === 1) {
    // Consecutive day; increment streak
    return { count: (currentStreak.count || 0) + 1, lastActiveDate: today };
  } else {
    // Gap greater than 1 day; reset streak to 1
    return { count: 1, lastActiveDate: today };
  }
}

/**
 * GET /api/academy/progress
 * Get user learning progress, completed courses, badges, and streaks.
 */
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || req.headers['x-guest-user-id'] || 'guest-learner';

    if (isDbConnected()) {
      let progress = await AcademyProgress.findOne({ userId });
      if (!progress) {
        progress = {
          userId,
          totalXp: 0,
          streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
          badges: ['badge-first-lesson'],
          completedCourses: [],
          completedLessons: [],
          quizAttempts: []
        };
      }
      return res.json({ success: true, progress });
    }

    // In-Memory Mode
    let progress = memoryStore.academyProgress.find((p) => p.userId === userId);
    if (!progress) {
      progress = {
        userId,
        totalXp: 0,
        streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
        badges: ['badge-first-lesson'],
        completedCourses: [],
        completedLessons: [],
        quizAttempts: []
      };
      memoryStore.academyProgress.push(progress);
    }

    return res.json({ success: true, progress });
  } catch (err) {
    console.error('[AcademyController] getProgress error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve academy progress' });
  }
};

/**
 * POST /api/academy/lesson-complete
 * Record completed lesson, award XP, and update streak.
 */
exports.saveLessonProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || req.headers['x-guest-user-id'] || 'guest-learner';
    const { courseId, lessonId } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, message: 'courseId and lessonId are required' });
    }

    const XP_PER_LESSON = 25;

    if (isDbConnected()) {
      let record = await AcademyProgress.findOne({ userId });
      if (!record) {
        record = new AcademyProgress({
          userId,
          totalXp: 0,
          streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
          badges: ['badge-first-lesson'],
          completedCourses: [],
          completedLessons: [],
          quizAttempts: []
        });
      }

      // Check if lesson was already completed
      const alreadyDone = record.completedLessons.some(
        (l) => l.courseId === courseId && l.lessonId === lessonId
      );

      if (!alreadyDone) {
        record.completedLessons.push({ courseId, lessonId, completedAt: new Date() });
        record.totalXp += XP_PER_LESSON;
      }

      record.streak = updateStreak(record.streak);

      // Check for streak badges
      if (record.streak.count >= 3 && !record.badges.includes('badge-streak-3')) {
        record.badges.push('badge-streak-3');
      }
      if (record.streak.count >= 7 && !record.badges.includes('badge-streak-7')) {
        record.badges.push('badge-streak-7');
      }

      await record.save();
      return res.json({ success: true, progress: record, xpEarned: alreadyDone ? 0 : XP_PER_LESSON });
    }

    // In-Memory Mode
    let record = memoryStore.academyProgress.find((p) => p.userId === userId);
    if (!record) {
      record = {
        userId,
        totalXp: 0,
        streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
        badges: ['badge-first-lesson'],
        completedCourses: [],
        completedLessons: [],
        quizAttempts: []
      };
      memoryStore.academyProgress.push(record);
    }

    const alreadyDone = record.completedLessons.some(
      (l) => l.courseId === courseId && l.lessonId === lessonId
    );

    if (!alreadyDone) {
      record.completedLessons.push({ courseId, lessonId, completedAt: new Date() });
      record.totalXp += XP_PER_LESSON;
    }

    record.streak = updateStreak(record.streak);

    if (record.streak.count >= 3 && !record.badges.includes('badge-streak-3')) {
      record.badges.push('badge-streak-3');
    }
    if (record.streak.count >= 7 && !record.badges.includes('badge-streak-7')) {
      record.badges.push('badge-streak-7');
    }

    return res.json({ success: true, progress: record, xpEarned: alreadyDone ? 0 : XP_PER_LESSON });
  } catch (err) {
    console.error('[AcademyController] saveLessonProgress error:', err);
    res.status(500).json({ success: false, message: 'Failed to record lesson completion' });
  }
};

/**
 * POST /api/academy/quiz-submit
 * Evaluate end-of-course quiz, calculate score, award badge and certificate ID if >= 80%.
 */
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || req.headers['x-guest-user-id'] || 'guest-learner';
    const { courseId, score, badgeId } = req.body;

    if (!courseId || score === undefined) {
      return res.status(400).json({ success: false, message: 'courseId and score are required' });
    }

    const passed = score >= 80;
    const certificateId = passed
      ? `DC-CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : null;

    if (isDbConnected()) {
      let record = await AcademyProgress.findOne({ userId });
      if (!record) {
        record = new AcademyProgress({
          userId,
          totalXp: 0,
          streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
          badges: ['badge-first-lesson'],
          completedCourses: [],
          completedLessons: [],
          quizAttempts: []
        });
      }

      record.quizAttempts.push({
        courseId,
        score,
        passed,
        completedAt: new Date()
      });

      if (score === 100 && !record.badges.includes('badge-quiz-ace')) {
        record.badges.push('badge-quiz-ace');
      }

      if (passed) {
        const existingIndex = record.completedCourses.findIndex((c) => c.courseId === courseId);
        if (existingIndex >= 0) {
          record.completedCourses[existingIndex].score = Math.max(record.completedCourses[existingIndex].score, score);
        } else {
          record.completedCourses.push({
            courseId,
            score,
            completedAt: new Date(),
            badgeAwarded: badgeId || null,
            certificateId
          });
          record.totalXp += 100; // 100 XP for passing course
        }

        if (badgeId && !record.badges.includes(badgeId)) {
          record.badges.push(badgeId);
        }

        if (record.completedCourses.length >= 10 && !record.badges.includes('badge-academy-graduate')) {
          record.badges.push('badge-academy-graduate');
        }
      }

      record.streak = updateStreak(record.streak);
      await record.save();

      return res.json({
        success: true,
        passed,
        score,
        certificateId,
        progress: record
      });
    }

    // In-Memory Mode
    let record = memoryStore.academyProgress.find((p) => p.userId === userId);
    if (!record) {
      record = {
        userId,
        totalXp: 0,
        streak: { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
        badges: ['badge-first-lesson'],
        completedCourses: [],
        completedLessons: [],
        quizAttempts: []
      };
      memoryStore.academyProgress.push(record);
    }

    record.quizAttempts.push({
      courseId,
      score,
      passed,
      completedAt: new Date()
    });

    if (score === 100 && !record.badges.includes('badge-quiz-ace')) {
      record.badges.push('badge-quiz-ace');
    }

    if (passed) {
      const existingIndex = record.completedCourses.findIndex((c) => c.courseId === courseId);
      if (existingIndex >= 0) {
        record.completedCourses[existingIndex].score = Math.max(record.completedCourses[existingIndex].score, score);
      } else {
        record.completedCourses.push({
          courseId,
          score,
          completedAt: new Date(),
          badgeAwarded: badgeId || null,
          certificateId
        });
        record.totalXp += 100;
      }

      if (badgeId && !record.badges.includes(badgeId)) {
        record.badges.push(badgeId);
      }

      if (record.completedCourses.length >= 10 && !record.badges.includes('badge-academy-graduate')) {
        record.badges.push('badge-academy-graduate');
      }
    }

    record.streak = updateStreak(record.streak);

    return res.json({
      success: true,
      passed,
      score,
      certificateId,
      progress: record
    });
  } catch (err) {
    console.error('[AcademyController] submitQuiz error:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate quiz' });
  }
};
