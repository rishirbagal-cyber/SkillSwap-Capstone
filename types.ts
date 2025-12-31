
export type SkillCategory = 'Development' | 'Design' | 'AI & Data' | 'Academics' | 'Soft Skills' | 'Other';

export interface Skill {
  name: string;
  category: SkillCategory;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Student {
  id: string;
  name: string;
  college: string;
  branch: string;
  year: number;
  strongSkills: string[];
  weakSkills: string[];
  teachingScore: number;
  learningScore: number;
  skillReputation: number;
  points: number;
  rank: string;
  avatar: string;
  badges: Badge[];
  streak: number;
}

export interface Match {
  partner: Student;
  matchPercentage: number;
  mutualStrongSkill: string;
  mutualWeakSkill: string;
}

export type SessionMode = 'F2F' | 'ONLINE';

export interface RoadmapStep {
  title: string;
  description: string;
}

export interface LearningResource {
  title: string;
  uri: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Session {
  id: string;
  partnerId: string;
  skill: string;
  timestamp: number;
  mode: SessionMode;
  score: number;
}
