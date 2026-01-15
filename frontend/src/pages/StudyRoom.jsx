import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import { Loader, BookOpen, BrainCircuit, Check, X } from "lucide-react";

const StudyRoom = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("summary"); // 'summary' or 'quiz'
  const [loading, setLoading] = useState(true);
  const [studyData, setStudyData] = useState(null); // { summary, quiz }
  const [videoUrl, setVideoUrl] = useState(null);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (state?.module) {
      initSession();
    }
  }, [state]);

  const initSession = async () => {
    try {
      const token = await user.getIdToken();

      // 1. Search for a real video URL based on the AI's query
      // NOTE: Ideally this happens on backend, but for hackathon, we can fetch the URL here
      // or assume the backend provided it. Let's assume backend provided `youtubeQuery`.
      // For this demo, I will use a placeholder or call a search endpoint.
      // *HACK*: We will just ask the user or use a hardcoded relevant video for the demo
      // if you don't have a YouTube Search API key.
      // Let's assume the backend 'study-video' endpoint handles the search if we send the query.

      // Call your backend "start-study-session"
      const res = await fetch("http://localhost:5000/api/study-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // In a real app, you'd send the video ID.
          // For now, let's pass the query and let backend find it,
          // OR pass a direct URL if you have one.
          videoUrl: `https://www.youtube.com/results?search_query=${state.module.youtubeQuery}`,
          // NOTE: You need to actually resolve this to a watch?v= URL.
          // For the hackathon, hardcode a URL or use a client-side search library.
        }),
      });

      // *Since we didn't implement YouTube Search in backend yet*,
      // let's simulate the video URL for the demo:
      const demoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Replace with logic
      setVideoUrl(demoUrl);

      const data = await res.json();
      setStudyData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold">Analyzing Video Content...</h2>
        <p className="text-gray-400 mt-2">
          Generating summary and quiz questions
        </p>
      </div>
    );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      {/* LEFT: Video Section */}
      <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative">
        <div className="aspect-video w-full h-full">
          {/* In a real app, use the actual URL returned from backend */}
          <ReactPlayer
            url={videoUrl || "https://www.youtube.com/watch?v=k5E2AVpwsko"} // Fallback React Tutorial
            width="100%"
            height="100%"
            controls
          />
        </div>
      </div>

      {/* RIGHT: AI Notebook Section */}
      <div className="w-full md:w-1/3 bg-white border-l border-gray-200 flex flex-col h-full">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === "summary"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            <BookOpen size={18} /> Summary
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === "quiz"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            <BrainCircuit size={18} /> Quiz
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "summary" ? (
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>
                {studyData?.summary || "No summary available."}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="space-y-8">
              {studyData?.quiz?.map((q, idx) => {
                const isCorrect = quizAnswers[idx] === q.correctAnswer;

                return (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-800 mb-3">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          disabled={quizSubmitted}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [idx]: opt }))
                          }
                          className={`w-full text-left p-3 rounded text-sm transition-all ${
                            quizSubmitted
                              ? opt === q.correctAnswer
                                ? "bg-green-100 border-green-500 text-green-800"
                                : quizAnswers[idx] === opt
                                ? "bg-red-100 border-red-500 text-red-800"
                                : "bg-white border-gray-200 opacity-50"
                              : quizAnswers[idx] === opt
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {quizSubmitted && (
                      <div
                        className={`mt-3 text-xs p-2 rounded ${
                          isCorrect
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!quizSubmitted && (
                <button
                  onClick={handleQuizSubmit}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyRoom;
