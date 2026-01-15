import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  auth,
  googleProvider,
  githubProvider,
  microsoftProvider,
} from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = async (firebaseUser) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();

      const response = await fetch("http://localhost:5000/api/user/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Backend Sync Success:", data);
    } catch (error) {
      console.error("Backend Sync Failed:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithBackend(result.user);
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const loginWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await syncUserWithBackend(result.user);
    } catch (error) {
      console.error("Github Login Error:", error);
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      await syncUserWithBackend(result.user);
    } catch (error) {
      console.error("Microsoft Login Error:", error);
    }
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    loginWithGoogle,
    loginWithGithub,
    loginWithMicrosoft,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
