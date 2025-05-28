import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFS-VoYjOeID6z2KJNw2_9OkbFyfKpGI0",
  authDomain: "cloud-campus-5ebdd.firebaseapp.com",
  projectId: "cloud-campus-5ebdd",
  storageBucket: "cloud-campus-5ebdd.appspot.com",
  messagingSenderId: "688845986487",
  appId: "1:688845986487:web:7cca28c4c826bed1ae0b32",
  measurementId: "G-1GYWHTCL76",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, signOut };
