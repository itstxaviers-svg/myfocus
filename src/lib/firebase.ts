import { initializeApp } from 'firebase/app';
import { browserLocalPersistence,getAuth,setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig={
  apiKey:'AIzaSyCANvlWT6JbQoWoPmlR6zLO65GrLBHT3cc',
  authDomain:'my-focus-3eff3.firebaseapp.com',
  projectId:'my-focus-3eff3',
  storageBucket:'my-focus-3eff3.firebasestorage.app',
  messagingSenderId:'882196347305',
  appId:'1:882196347305:web:fb1f073a62cc6314bbecb8'
};

export const firebaseApp=initializeApp(firebaseConfig);
export const firebaseAuth=getAuth(firebaseApp);
export const firestore=getFirestore(firebaseApp);
export const authPersistenceReady=setPersistence(firebaseAuth,browserLocalPersistence);
