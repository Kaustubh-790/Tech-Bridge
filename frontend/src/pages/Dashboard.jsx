import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-lg mb-2">
          Hello, <strong>{user?.displayName}</strong>!
        </p>
        <p className="text-gray-500 mb-4">Email: {user?.email}</p>

        {/* Placeholder for Domain Selection */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
          <p>Select domains will appear here...</p>
        </div>

        <button
          onClick={logout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
