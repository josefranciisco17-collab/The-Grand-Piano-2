import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyArKUqthRHDrO1xXn39wJP-JCiBZdilOcY",
authDomain: "piano-deluxe-premium.firebaseapp.com",
projectId: "piano-deluxe-premium",
storageBucket: "piano-deluxe-premium.firebasestorage.app",
messagingSenderId: "79307845171",
appId: "1:79307845171:web:c21918694f6d916fbbfd46"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
