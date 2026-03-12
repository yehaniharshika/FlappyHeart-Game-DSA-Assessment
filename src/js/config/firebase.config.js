const firebaseConfig = {
    apiKey:            "AIzaSyCeqVKHZB-NF7AKqo8zTiQmcagL5YPGP4U",
    authDomain:        "flappy-heart-6c63b.firebaseapp.com",
    projectId:         "flappy-heart-6c63b",
    storageBucket:     "flappy-heart-6c63b.firebasestorage.app",
    messagingSenderId: "930033776532",
    appId:             "1:930033776532:web:2500b911e6aaed4111c181"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore DB instance — available globally for auth.js
const db = firebase.firestore();