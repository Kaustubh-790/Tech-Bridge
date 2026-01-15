import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.js";
import SkillAssessment from "../models/skillAssesment.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const cleanJSON = (text) => {
  return text.replace(/```json|```/g, "").trim();
};

export const startAssessment = async (req, res) => {
  const { domain } = req.body;
  const uid = req.user.uid;

  try {
    await User.findByIdAndUpdate(uid, { selectedDomain: domain });

    let assessment = await SkillAssessment.findOne({ user: uid, domain });

    if (assessment && assessment.currentLevel === "Completed") {
      return res.status(200).json({ message: "Course Completed" });
    }
    if (!assessment) {
      assessment = new SkillAssessment({
        user: uid,
        domain: domain,
        currentLevel: "Beginner",
      });
    }

    assessment.currentSession = {
      startTime: new Date(),
      questions: [],
      answers: [],
    };

    const prompt = `
      You are a technical interviewer. Generate 1 "Beginner" level Multiple Choice Question (MCQ) for the domain "${domain}".
      
      Return STRICTLY a JSON object in this format:
      {
        "id": 1,
        "text": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A"
      }
    `;

    const result = await model.generateContent(prompt);
    const q1 = JSON.parse(cleanJSON(result.response.text()));

    assessment.currentSession.questions.push(q1);
    await assessment.save();

    const { correctAnswer, ...questionForUser } = q1;

    res.status(200).json({
      assessmentId: assessment._id,
      question: questionForUser,
      progress: 1,
      total: 5,
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    res
      .status(500)
      .json({ message: "Failed to generate question", error: error.message });
  }
};

export const submitAssessment = async (req, res) => {
  const { assessmentId, answer } = req.body;

  try {
    const assessment = await SkillAssessment.findById(assessmentId);
    if (!assessment)
      return res.status(404).json({ message: "Assessment not found" });

    assessment.currentSession.answers.push(answer);
    const currentCount = assessment.currentSession.answers.length;
    const totalQuestions = 5;

    if (currentCount >= totalQuestions) {
      return await finishAndGrade(assessment, res);
    }

    const nextIndex = currentCount + 1;
    const previousQuestions = assessment.currentSession.questions
      .map((q) => q.text)
      .join(" || ");

    const prompt = `
      You are a technical interviewer. Generate 1 "${assessment.currentLevel}" level MCQ for "${assessment.domain}".
      
      Constraint: Do NOT repeat these previous concepts: ${previousQuestions}
      
      Return STRICTLY a JSON object:
      {
        "id": ${nextIndex},
        "text": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "Correct Option String"
      }
    `;

    const result = await model.generateContent(prompt);
    const nextQ = JSON.parse(cleanJSON(result.response.text()));

    assessment.currentSession.questions.push(nextQ);
    await assessment.save();

    const { correctAnswer, ...questionForUser } = nextQ;
    res.status(200).json({
      question: questionForUser,
      progress: nextIndex,
      total: totalQuestions,
    });
  } catch (error) {
    console.error("Error fetching next question:", error);
    res.status(500).json({ error: error.message });
  }
};

const finishAndGrade = async (assessment, res) => {
  const { questions, answers } = assessment.currentSession;

  let score = 0;
  questions.forEach((q, index) => {
    if (q.correctAnswer === answers[index]) {
      score++;
    }
  });

  const passed = score >= 4;
  let nextLevel = assessment.currentLevel;
  let feedback = `You scored ${score}/5. `;

  if (passed) {
    if (assessment.currentLevel === "Beginner") nextLevel = "Intermediate";
    else if (assessment.currentLevel === "Intermediate") nextLevel = "Advanced";
    else nextLevel = "Completed";
    feedback += "Great job! Moving to next level.";
  } else {
    feedback += "Keep practicing to advance.";
  }

  assessment.history.push({
    level: assessment.currentLevel,
    questions,
    answers,
    score,
    passed,
  });

  if (passed && nextLevel !== "Completed") {
    assessment.currentLevel = nextLevel;
  }

  assessment.currentSession = { questions: [], answers: [] };
  await assessment.save();

  res.status(200).json({
    finished: true,
    score,
    passed,
    nextLevel,
    feedback,
  });
};
