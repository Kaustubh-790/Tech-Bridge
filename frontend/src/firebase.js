import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwvN3UbwEqV6_0IGPcSe9IG5BFAQHPDCA",
  authDomain: "tech-bridge-50111.firebaseapp.com",
  projectId: "tech-bridge-50111",
  storageBucket: "tech-bridge-50111.firebasestorage.app",
  messagingSenderId: "756399645317",
  appId: "1:756399645317:web:09650a16419137e21f3fec",
  measurementId: "G-C2ZWYZ6LDG",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");
