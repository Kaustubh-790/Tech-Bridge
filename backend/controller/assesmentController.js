import axios from "axios";
import User from "../models/user.js";
import SkillAssessment from "../models/skillAssesment.js";

const PYTHON_LLM_URL = process.env.PYTHON_LLM_URL || "http://localhost:8000";

export const startAssessment = async (req, res) => {
  const { domain } = req.body;
  const uid = req.user.uid;

  try {
    await User.findByIdAndUpdate(uid, { selectedDomain: domain });

    const primaryDomain = domain;

    const llmResponse = await axios.post(
      `${PYTHON_LLM_URL}/generate-questions`,
      {
        domain: primaryDomain,
        level: "Beginner",
        count: 5,
      }
    );

    const assessment = new SkillAssessment({
      user: uid,
      domain: primaryDomain,
      currentLevel: "Beginner",
      history: [],
    });

    await assessment.save();

    res.status(200).json({
      assessmentId: assessment._id,
      questions: llmResponse.data.questions,
    });
  } catch (error) {
    console.error("Error starting assessment:", error.message);
    res
      .status(500)
      .json({ message: "Failed to generate questions", error: error.message });
  }
};

export const submitAssessment = async (req, res) => {
  const { assessmentId, answers, questions } = req.body;

  try {
    const gradingResponse = await axios.post(
      `${PYTHON_LLM_URL}/grade-answers`,
      {
        questions,
        answers,
      }
    );

    const { score } = gradingResponse.data;

    const passed = score >= 4;
    let nextLevel = null;

    const currentAssessment = await SkillAssessment.findById(assessmentId);
    if (passed) {
      if (currentAssessment.currentLevel === "Beginner")
        nextLevel = "Intermediate";
      else if (currentAssessment.currentLevel === "Intermediate")
        nextLevel = "Advanced";
      else nextLevel = "Completed";
    }

    const updateData = {
      $push: {
        history: {
          level: currentAssessment.currentLevel,
          score,
          passed,
          questions,
        },
      },
    };

    if (passed && nextLevel) {
      updateData.currentLevel = nextLevel;
    }

    await SkillAssessment.findByIdAndUpdate(assessmentId, updateData);

    let nextQuestions = [];
    if (passed && nextLevel && nextLevel !== "Completed") {
      const llmNext = await axios.post(`${PYTHON_LLM_URL}/generate-questions`, {
        domain: currentAssessment.domain,
        level: nextLevel,
        count: 5,
      });
      nextQuestions = llmNext.data.questions;
    }

    res.json({
      score,
      passed,
      nextLevel,
      nextQuestions,
    });
  } catch (error) {
    console.error("Error submitting assessment:", error.message);
    res.status(500).json({ error: error.message });
  }
};
