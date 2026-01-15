import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const { user, loginWithGoogle, loginWithGithub, loginWithMicrosoft } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome to Tech Bridge</h2>
        <p className="mb-6 text-gray-600">Please sign in to continue</p>

        <div className="space-y-4">
          <button
            onClick={loginWithGoogle}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Login with Google
          </button>

          <button
            onClick={loginWithGithub}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
          >
            Login with GitHub
          </button>

          <button
            onClick={loginWithMicrosoft}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
