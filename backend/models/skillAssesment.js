import mongoose from "mongoose";

const skillAssessmentSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Completed"],
    default: "Beginner",
  },

  currentSession: {
    startTime: { type: Date, default: Date.now },
    questions: [],
    answers: [],
  },
  history: [
    {
      level: String,
      questions: Array,
      answers: Array,
      score: Number,
      passed: Boolean,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const SkillAssessment = mongoose.model(
  "SkillAssessment",
  skillAssessmentSchema
);
export default SkillAssessment;
