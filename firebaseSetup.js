// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdDO60u619TH9vdeOFjl7hhCH--CuofIw",
  authDomain: "thebigsilk.firebaseapp.com",
  projectId: "thebigsilk",
  storageBucket: "thebigsilk.appspot.com",
  messagingSenderId: "93911580319",
  appId: "1:93911580319:web:0960164c2d2a97ccabecaa",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
let storage = getStorage(firebase);

export default storage;
