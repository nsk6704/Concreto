import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

// Your web app's Firebase configuration
// Replace this with your own Firebase project credentials
export const firebaseConfig = {
  apiKey: 'AIzaSyBhYT97by1Ct0j7-30uXW8nSObbna80msU',
  authDomain: 'concreto2-a1e70.firebaseapp.com',
  projectId: 'concreto2-a1e70',
  storageBucket: 'concreto2-a1e70.firebasestorage.app',
  messagingSenderId: '615374101129',
  appId: '1:615374101129:web:e1be13c2c8fc109ddc0458',
  measurementId: 'G-M51JKRXQ9X',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
