import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ChatMessage } from '../types';

export const chatService = {
  // Generate a unique chat ID between two users
  getChatId: (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  },

  // Send a message
  sendMessage: async (chatId: string, text: string, senderId: string) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId,
      timestamp: serverTimestamp(),
      read: false
    });
  },

  // Subscribe to real-time messages
  subscribeToMessages: (chatId: string, callback: (messages: ChatMessage[]) => void) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    });
  }
};
