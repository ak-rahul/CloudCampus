import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBVah9hOArfjhLj1RQQnAMxwtvYHBPeG9Y",
  authDomain: "cloud-campus-343bb.firebaseapp.com",
  projectId: "cloud-campus-343bb",
  storageBucket: "cloud-campus-343bb.appspot.com",
  messagingSenderId: "623426945533",
  appId: "1:623426945533:web:7dba5dd874b0676e6e5994",
  measurementId: "G-737LK0489S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);