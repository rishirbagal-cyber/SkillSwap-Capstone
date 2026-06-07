
import { Student, Badge, SkillCategory } from './types';
import { Layout, Users, Book, Trophy, Target, MessageSquareCode } from 'lucide-react';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Development', 'AI & Data', 'Design', 'Academics', 'Soft Skills'
];

// Map individual skills to categories for robust filtering
export const SKILL_MAP: Record<string, SkillCategory> = {
  'React': 'Development',
  'Node.js': 'Development',
  'Tailwind': 'Development',
  'TypeScript': 'Development',
  'HTML': 'Development',
  'CSS': 'Development',
  'Java': 'Development',
  'C++': 'Development',
  'Python': 'AI & Data',
  'Machine Learning': 'AI & Data',
  'PyTorch': 'AI & Data',
  'SQL': 'AI & Data',
  'Data Structures': 'Academics',
  'System Design': 'Development',
  'Figma': 'Design',
  'UI Design': 'Design',
  'Interaction Design': 'Design',
  'Public Speaking': 'Soft Skills',
  'Technical Writing': 'Soft Skills',
  'Communication': 'Soft Skills',
  'Programming': 'Development'
};

export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Layout },
  { id: 'matching', label: 'Explore Hub', icon: Users },
  { id: 'learnhub', label: 'Learn Hub', icon: Book },
  { id: 'sessions', label: 'History', icon: Book },
  { id: 'leaderboard', label: 'Rankings', icon: Trophy },
  { id: 'marketplace', label: 'Assets', icon: Target },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquareCode },
];
