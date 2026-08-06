import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { ChatMessage } from '../types';

export const chatService = {
  // Generate a deterministic unique chat ID between two users
  getChatId: (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  },

  // Send a message and update conversation metadata
  sendMessage: async (chatId: string, text: string, senderId: string, participants: string[]) => {
    const conversationRef = doc(db, 'conversations', chatId);
    
    // Upsert conversation metadata
    await setDoc(conversationRef, {
      participants,
      lastMessage: text,
      lastSenderId: senderId,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Add message to subcollection
    const messagesRef = collection(conversationRef, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId,
      createdAt: serverTimestamp(),
      read: false
    });
  },

  // Subscribe to real-time messages for a conversation
  subscribeToMessages: (chatId: string, callback: (messages: ChatMessage[]) => void) => {
    const messagesRef = collection(db, 'conversations', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    });
  }
};
