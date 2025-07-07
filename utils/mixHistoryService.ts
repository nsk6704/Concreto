import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './authService';

// Initialize Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface MixData {
  id?: string;
  userId: string;
  date: Date;
  cement: number;
  sand: number;
  water: number;
  temperature?: number;
  moisture?: number;
  loadCell?: number;
  notes?: string;
}

export const saveMixData = async (mixData: MixData) => {
  try {
    const docRef = await addDoc(collection(db, 'mixHistory'), {
      ...mixData,
      date: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving mix data:', error);
    throw error;
  }
};

// Simplified version that doesn't require a Firestore index
export const getUserMixHistory = async (userId: string) => {
  try {
    // Get all documents and filter client-side
    const snapshot = await getDocs(collection(db, 'mixHistory'));

    const history = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }))
      .filter((doc) => doc.userId === userId)
      .sort((a, b) => b.date - a.date); // Sort by date, newest first

    return history as MixData[];
  } catch (error) {
    console.error('Error getting mix history:', error);
    return [];
  }
};

// Generate recommendations based on mix history
export const generateRecommendations = (mixHistory: MixData[]) => {
  if (!mixHistory || mixHistory.length === 0) {
    return {
      recommended: { cement: 35, sand: 45, water: 20 },
      message: 'Standard mix recommended for beginners.',
    };
  }

  // Find the most recent successful mix
  const recentMix = mixHistory[0];

  // Simple recommendation logic
  if (recentMix.cement > 40) {
    return {
      recommended: { cement: 40, sand: 45, water: 15 },
      message: 'High strength mix recommended based on your history.',
    };
  } else if (recentMix.water > 25) {
    return {
      recommended: { cement: 35, sand: 45, water: 20 },
      message: 'Consider reducing water content for better strength.',
    };
  }

  return {
    recommended: { cement: 35, sand: 45, water: 20 },
    message: 'Standard mix recommended based on your history.',
  };
};
