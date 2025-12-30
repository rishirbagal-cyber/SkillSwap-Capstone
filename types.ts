
export type Skill = string;

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
  strongSkills: Skill[];
  weakSkills: Skill[];
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
  mutualStrongSkill: Skill;
  mutualWeakSkill: Skill;
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

// Added Session interface to fix error in services/storageService.ts
export interface Session {
  id: string;
  partnerId: string;
  skill: string;
  timestamp: number;
  mode: SessionMode;
  score: number;
}
