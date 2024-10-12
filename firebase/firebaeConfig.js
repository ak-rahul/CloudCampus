import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Correct import for AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyBVah9hOArfjhLj1RQQnAMxwtvYHBPeG9Y",
  authDomain: "cloud-campus-343bb.firebaseapp.com",
  projectId: "cloud-campus-343bb",
  storageBucket: "cloud-campus-343bb.appspot.com",
  messagingSenderId: "623426945533",
  appId: "1:623426945533:web:7dba5dd874b0676e6e5994",
  measurementId: "G-737LK0489S"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage) // Use AsyncStorage for persistence
});

export { app, auth };

