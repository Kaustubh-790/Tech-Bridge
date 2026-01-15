import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);

  const [assessmentId, setAssessmentId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  const domains = [
    "Web Development",
    "Artificial Intelligence",
    "React.js",
    "Python",
  ];

  const getAuthHeader = async () => {
    const token = await user.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleStart = async (selectedDomain) => {
    const d = selectedDomain || domain;

    setLoading(true);
    setQuizResult(null);

    try {
      const headers = await getAuthHeader();
      const res = await fetch("http://localhost:5000/api/assessment/start", {
        method: "POST",
        headers,
        body: JSON.stringify({ domain: d }),
      });
      const data = await res.json();

      if (data.message === "Course Completed") {
        alert("You have already completed this course!");
        setDomain("");
        return;
      }

      setAssessmentId(data.assessmentId);
      setCurrentQuestion(data.question);
      setProgress(data.progress);
      setDomain(d);
      setSelectedOption(null);
    } catch (err) {
      console.error(err);
      alert("Error starting quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) return;
    setLoading(true);

    try {
      const headers = await getAuthHeader();
      const res = await fetch("http://localhost:5000/api/assessment/submit", {
        method: "POST",
        headers,
        body: JSON.stringify({
          assessmentId,
          answer: selectedOption,
        }),
      });
      const data = await res.json();

      if (data.finished) {
        setQuizResult(data);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data.question);
        setProgress(data.progress);
        setSelectedOption(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to navigate to Learning Path
  const handleGeneratePath = () => {
    if (!quizResult) return;

    navigate("/learning-path", {
      state: {
        domain: domain,
        // If they failed, nextLevel is just their current level (which is what we want)
        // If they passed, nextLevel is the new higher level
        level: quizResult.nextLevel,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Tech Bridge</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">{user.email}</p>
            {domain && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {domain}
              </span>
            )}
          </div>
        </header>

        {!currentQuestion && !quizResult && (
          <div className="bg-white p-6 rounded-lg shadow-md transition-all">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Select a Skill to Assess
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => handleStart(d)}
                  disabled={loading}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-700"
                >
                  {d}
                </button>
              ))}
            </div>
            {loading && (
              <p className="mt-6 text-center text-blue-600 animate-pulse">
                Initializing Assessment...
              </p>
            )}
          </div>
        )}

        {currentQuestion && (
          <div className="bg-white p-6 rounded-lg shadow-md transition-all">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <span className="text-sm font-bold text-blue-600 tracking-wide">
                QUESTION {progress} / 5
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                Single Choice
              </span>
            </div>

            <h3 className="text-xl font-medium mb-6 text-gray-800 leading-relaxed">
              {currentQuestion.text}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                    selectedOption === opt
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm"
                      : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                        selectedOption === opt
                          ? "border-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedOption === opt && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    {opt}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedOption || loading}
              className="mt-8 w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : progress === 5
                ? "Finish & Grade"
                : "Next Question"}
            </button>
          </div>
        )}

        {quizResult && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center transition-all">
            {quizResult.passed ? (
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Level Passed!
                </h2>
                <p className="text-green-600 font-medium">
                  Ready for {quizResult.nextLevel}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Level Failed
                </h2>
                <p className="text-red-500">
                  Let's generate a study plan to master {quizResult.nextLevel}.
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {quizResult.score} / 5
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {quizResult.feedback}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setQuizResult(null);
                  setDomain("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Back to Menu
              </button>

              {/* UPDATED LOGIC: Button shows for BOTH passed and failed */}
              {quizResult.nextLevel !== "Completed" && (
                <button
                  onClick={handleGeneratePath}
                  className={`px-6 py-2 rounded-lg font-medium shadow-md transition-colors text-white ${
                    quizResult.passed
                      ? "bg-blue-600 hover:bg-blue-700" // Blue for Advance
                      : "bg-gray-800 hover:bg-gray-900" // Dark for Remedial
                  }`}
                >
                  {quizResult.passed
                    ? `Start ${quizResult.nextLevel} Journey \u2192`
                    : `Generate ${quizResult.nextLevel} Study Plan \u2192`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
