
import React from 'react';
import { Book, GraduationCap, Trophy, Users, Zap, Award, Target, Layout } from 'lucide-react';
import { Student, Badge } from './types';

export const BADGES: Badge[] = [
  { id: 'b1', name: 'Eagle Eye', icon: '🦅', description: 'Spotting 10 errors in sessions' },
  { id: 'b2', name: 'Master Tutor', icon: '🏆', description: 'Taught over 50 hours' },
  { id: 'b3', name: 'Knowledge Sponge', icon: '🧽', description: 'Learned 5 new skills' },
  { id: 'b4', name: 'Streak King', icon: '🔥', description: '7-day learning streak' },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Alex Johnson',
    college: 'Engineering Institute',
    branch: 'Computer Science',
    year: 3,
    strongSkills: ['React', 'Node.js', 'Tailwind'],
    weakSkills: ['Data Structures', 'C++', 'System Design'],
    teachingScore: 4.8,
    learningScore: 4.5,
    skillReputation: 4,
    points: 1250,
    rank: 'Pro',
    avatar: 'https://picsum.photos/200/200?random=1',
    badges: [BADGES[0], BADGES[1]],
    streak: 5,
  },
  {
    id: 's2',
    name: 'Priya Sharma',
    college: 'Tech University',
    branch: 'Information Technology',
    year: 2,
    strongSkills: ['Data Structures', 'C++', 'Java'],
    weakSkills: ['React', 'CSS', 'Figma'],
    teachingScore: 4.9,
    learningScore: 4.7,
    skillReputation: 5,
    points: 1400,
    rank: 'Expert',
    avatar: 'https://picsum.photos/200/200?random=2',
    badges: [BADGES[2], BADGES[3]],
    streak: 12,
  },
  {
    id: 's3',
    name: 'Michael Chen',
    college: 'State Tech',
    branch: 'Software Engineering',
    year: 4,
    strongSkills: ['System Design', 'Python', 'Machine Learning'],
    weakSkills: ['Node.js', 'TypeScript'],
    teachingScore: 4.6,
    learningScore: 4.8,
    skillReputation: 3,
    points: 900,
    rank: 'Apprentice',
    avatar: 'https://picsum.photos/200/200?random=3',
    badges: [BADGES[1]],
    streak: 3,
  },
  {
    id: 's4',
    name: 'Sarah Miller',
    college: 'Engineering Institute',
    branch: 'AI & DS',
    year: 1,
    strongSkills: ['Figma', 'UI Design', 'HTML'],
    weakSkills: ['Python', 'SQL'],
    teachingScore: 4.2,
    learningScore: 4.9,
    skillReputation: 4,
    points: 500,
    rank: 'Novice',
    avatar: 'https://picsum.photos/200/200?random=4',
    badges: [],
    streak: 1,
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Layout },
  { id: 'matching', label: 'Find Matches', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: Book },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'marketplace', label: 'Marketplace', icon: Target },
];
