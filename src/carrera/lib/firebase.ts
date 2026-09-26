import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  where
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  score: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  createdAt: string;
}

const COLLECTION_NAME = 'leaderboard_entries';

/**
 * Submits a new score to the global Firestore leaderboard
 */
export async function submitScore(playerName: string, score: number, difficulty: 'easy' | 'normal' | 'hard' | 'extreme'): Promise<boolean> {
  if (!playerName || !playerName.trim() || score <= 0) {
    return false;
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    await addDoc(colRef, {
      playerName: playerName.trim().slice(0, 25),
      score,
      difficulty,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error submitting score to Firebase leaderboard:', error);
    return false;
  }
}

/**
 * Subscribes to real-time top scores
 */
export function subscribeToLeaderboard(
  difficultyFilter: 'all' | 'easy' | 'normal' | 'hard' | 'extreme',
  maxResults: number,
  callback: (entries: LeaderboardEntry[]) => void
) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    
    let q;
    if (difficultyFilter !== 'all') {
      q = query(
        colRef, 
        where('difficulty', '==', difficultyFilter),
        orderBy('score', 'desc'), 
        limit(maxResults)
      );
    } else {
      q = query(
        colRef, 
        orderBy('score', 'desc'), 
        limit(maxResults)
      );
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const entries: LeaderboardEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<LeaderboardEntry, 'id'>)
        }));
        callback(entries);
      },
      (error) => {
        console.error('Leaderboard snapshot error:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to leaderboard:', error);
    callback([]);
    return () => {};
  }
}
