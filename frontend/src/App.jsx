import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearningPath from "./pages/LearningPath"; // Import
import StudyRoom from "./pages/StudyRoom"; // Import

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* NEW ROUTES */}
      <Route
        path="/learning-path"
        element={
          <ProtectedRoute>
            <LearningPath />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study"
        element={
          <ProtectedRoute>
            <StudyRoom />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
