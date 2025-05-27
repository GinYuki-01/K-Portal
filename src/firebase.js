// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDgX53TWO80Q75-PCWIrHIb8OaBUU2IzrM",
  authDomain: "komazawa-portal.firebaseapp.com",
  projectId: "komazawa-portal",
  storageBucket: "komazawa-portal.firebasestorage.app",
  messagingSenderId: "780389991486",
  appId: "1:780389991486:web:d69eb7750b4f509a60fd6f"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
