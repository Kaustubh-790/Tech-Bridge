import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, PlayCircle, CheckCircle, Loader } from "lucide-react";

const LearningPath = () => {
  const { state } = useLocation(); // { domain, level } passed from Dashboard
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state?.domain && state?.level) {
      fetchPath();
    }
  }, [state]);

  const fetchPath = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:5000/api/learning-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          domain: state.domain,
          level: state.level,
        }),
      });
      const data = await res.json();
      setModules(data.modules || []);
    } catch (err) {
      console.error(err);
      alert("Failed to generate path");
    } finally {
      setLoading(false);
    }
  };

  const handleStartModule = (module) => {
    // We navigate to the Study Room with the YouTube query
    // The Study Room will first find the video URL then process it
    navigate("/study", { state: { module } });
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          AI is crafting your curriculum...
        </h2>
        <p className="text-gray-500">
          Curating the best YouTube content for {state?.domain}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Learning Path
          </h1>
          <p className="text-gray-600 mt-2">
            Target:{" "}
            <span className="font-semibold text-blue-600">
              {state?.level} {state?.domain}
            </span>
          </p>
        </header>

        <div className="relative border-l-4 border-blue-200 ml-4 space-y-12">
          {modules.map((mod, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Timeline Dot */}
              <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow"></div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {mod.title}
                    </h3>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded mt-2 inline-block">
                      Module {idx + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartModule(mod)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                  >
                    <PlayCircle size={18} />
                    Start Session
                  </button>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
