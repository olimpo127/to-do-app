// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHehbRVzXe5yK8GkSBod-EiqP4BRoBGo8",
  authDomain: "optimized-task-manager.firebaseapp.com",
  projectId: "optimized-task-manager",
  storageBucket: "optimized-task-manager.appspot.com",
  messagingSenderId: "485957607425",
  appId: "1:485957607425:web:f86d2da7b0adaef34ce000",
  measurementId: "G-YR3SHCX8Q6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, firestore, storage, analytics, googleProvider };
