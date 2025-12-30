
import { Student, Session } from '../types';
import { MOCK_STUDENTS } from '../constants';

const KEY_STUDENTS = 'skillswap_students';
const KEY_CURRENT_USER_ID = 'skillswap_current_user_id';
const KEY_SESSIONS = 'skillswap_sessions';
const KEY_THEME = 'skillswap_theme';

export const storageService = {
  init: () => {
    if (!localStorage.getItem(KEY_STUDENTS)) {
      localStorage.setItem(KEY_STUDENTS, JSON.stringify(MOCK_STUDENTS));
    }
    if (!localStorage.getItem(KEY_SESSIONS)) {
      localStorage.setItem(KEY_SESSIONS, JSON.stringify([]));
    }
  },

  getStudents: (): Student[] => {
    return JSON.parse(localStorage.getItem(KEY_STUDENTS) || '[]');
  },

  getCurrentUser: (): Student | null => {
    const students = storageService.getStudents();
    const id = localStorage.getItem(KEY_CURRENT_USER_ID);
    if (!id) return null;
    return students.find(s => s.id === id) || null;
  },

  updateUser: (updatedUser: Student) => {
    const students = storageService.getStudents();
    const index = students.findIndex(s => s.id === updatedUser.id);
    if (index !== -1) {
      students[index] = updatedUser;
    } else {
      students.push(updatedUser);
    }
    localStorage.setItem(KEY_STUDENTS, JSON.stringify(students));
    localStorage.setItem(KEY_CURRENT_USER_ID, updatedUser.id);
  },

  logout: () => {
    localStorage.removeItem(KEY_CURRENT_USER_ID);
  },

  setTheme: (isDark: boolean) => {
    localStorage.setItem(KEY_THEME, isDark ? 'dark' : 'light');
  },

  getTheme: (): boolean => {
    return localStorage.getItem(KEY_THEME) === 'dark';
  },

  getSessions: (): Session[] => {
    return JSON.parse(localStorage.getItem(KEY_SESSIONS) || '[]');
  },

  saveSession: (session: Session) => {
    const sessions = storageService.getSessions();
    sessions.push(session);
    localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions));
  }
};
