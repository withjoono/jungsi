import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAo3YfEVPqRE5Pm7OUCByadZ3Yg56y4zHI",
  authDomain: "geobukschool.firebaseapp.com",
  projectId: "geobukschool",
  storageBucket: "geobukschool.firebasestorage.app",
  messagingSenderId: "69298836213",
  appId: "1:69298836213:web:15f6ef87bf5b9f0aadebbc",
  measurementId: "G-DNKPV8QPCK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };
