import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, signOut,getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCFS-VoYjOeID6z2KJNw2_9OkbFyfKpGI0",
  authDomain: "cloud-campus-5ebdd.firebaseapp.com",
  projectId: "cloud-campus-5ebdd",
  storageBucket: "cloud-campus-5ebdd.appspot.com",
  messagingSenderId: "688845986487",
  appId: "1:688845986487:web:7cca28c4c826bed1ae0b32",
  measurementId: "G-1GYWHTCL76",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export { signOut };

