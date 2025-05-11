import { initializeApp,getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';




const firebaseConfig = {
    apiKey: "AIzaSyCRqRZ74fTG_qYyvzw3xwGngtY_alV0VKw",
    authDomain: "cataract-detection-69446.firebaseapp.com",
    projectId: "cataract-detection-69446",
    storageBucket: "cataract-detection-69446.firebasestorage.app",
    messagingSenderId: "745709960440",
    appId: "1:745709960440:web:e0ae3b5616cc53ec45cf0d",
    measurementId: "G-1PQEEMQ2PF",
  };
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
