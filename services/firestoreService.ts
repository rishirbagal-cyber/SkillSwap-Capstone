import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { Student } from '../types';
import { DEFAULT_AVATAR } from '../constants';

const USERS_COLLECTION = 'users';

export const firestoreService = {
  // Get a single user by UID
  getUser: async (uid: string): Promise<Student | null> => {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, uid: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
  },

  // Update or create a user profile
  updateUser: async (uid: string, data: Partial<Student>) => {
    const docRef = doc(db, USERS_COLLECTION, uid);
    
    // Ensure avatar is never undefined
    const safeData = { ...data };
    if (!safeData.avatar) {
      safeData.avatar = DEFAULT_AVATAR;
    }

    await setDoc(docRef, safeData, { merge: true });
  },

  // Subscribe to all users (for Explore Hub, Leaderboard, etc.)
  subscribeToUsers: (callback: (users: Student[]) => void) => {
    const q = query(collection(db, USERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const users: Student[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, uid: doc.id, ...doc.data() } as Student);
      });
      callback(users);
    });
  },

  // Subscribe to current user
  subscribeToUser: (uid: string, callback: (user: Student | null) => void) => {
    const docRef = doc(db, USERS_COLLECTION, uid);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() } as Student);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Error subscribing to user:", error);
      callback(null);
    });
  }
};
