// js/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBzSHkVxRiLC5gsq04LTTDnXaGdoF7eJ2c",
  authDomain: "easyregistrationforms.firebaseapp.com",
  projectId: "easyregistrationforms",
  storageBucket: "easyregistrationforms.firebasestorage.app",
  messagingSenderId: "589421628989",
  appId: "1:589421628989:web:d9f6e9dbe372ab7acd6454",
  measurementId: "G-GVCPBN8VB5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase modules
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db, firebase };
