const mongoose = require('mongoose');

const completedCourseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 100 },
    badgeAwarded: { type: String },
    certificateId: { type: String }
  },
  { _id: false }
);

const completedLessonSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    completedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const academyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    totalXp: {
      type: Number,
      default: 0
    },
    streak: {
      count: { type: Number, default: 1 },
      lastActiveDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
    },
    badges: [{ type: String }],
    completedCourses: [completedCourseSchema],
    completedLessons: [completedLessonSchema],
    quizAttempts: [quizAttemptSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademyProgress', academyProgressSchema);
