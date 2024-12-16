import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getStorage } from 'firebase/storage'; // Import Storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from "firebase/auth"; // Correct import for AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyCFS-VoYjOeID6z2KJNw2_9OkbFyfKpGI0",
  authDomain: "cloud-campus-5ebdd.firebaseapp.com",
  projectId: "cloud-campus-5ebdd",
  storageBucket: "cloud-campus-5ebdd.appspot.com",
  messagingSenderId: "688845986487",
  appId: "1:688845986487:web:7cca28c4c826bed1ae0b32",
  measurementId: "G-1GYWHTCL76"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export {signOut};


