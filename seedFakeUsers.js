import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "skillswap-e6d24.firebaseapp.com",
  databaseURL: "https://skillswap-e6d24-default-rtdb.firebaseio.com",
  projectId: "skillswap-e6d24",
  storageBucket: "skillswap-e6d24.firebasestorage.app",
  messagingSenderId: "591931818274",
  appId: "1:591931818274:web:eefcd7b901614eb589781b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROFESSIONAL_AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";

const fakeUsers = [
  {
    id: "fake_user_1",
    name: "Alex Chen",
    college: "Stanford University",
    major: "Computer Science",
    avatar: PROFESSIONAL_AVATAR,
    strongSkills: ["React", "TypeScript", "Node.js"],
    weakSkills: ["Machine Learning", "Python"],
    points: 1250,
    streak: 12,
    rank: "Expert",
    skillReputation: 4.8,
    teachingScore: 4.9,
    sessionsCount: 15,
    completedTopics: ["React", "TypeScript"]
  },
  {
    id: "fake_user_2",
    name: "Sarah Jenkins",
    college: "MIT",
    major: "Data Science",
    avatar: PROFESSIONAL_AVATAR,
    strongSkills: ["Python", "Machine Learning", "SQL"],
    weakSkills: ["React", "CSS"],
    points: 2100,
    streak: 24,
    rank: "Master",
    skillReputation: 4.9,
    teachingScore: 5.0,
    sessionsCount: 32,
    completedTopics: ["Python", "SQL", "Machine Learning"]
  },
  {
    id: "fake_user_3",
    name: "David Kim",
    college: "UC Berkeley",
    major: "Design",
    avatar: PROFESSIONAL_AVATAR,
    strongSkills: ["Figma", "UI Design", "Interaction Design"],
    weakSkills: ["HTML", "CSS", "React"],
    points: 850,
    streak: 5,
    rank: "Intermediate",
    skillReputation: 4.5,
    teachingScore: 4.2,
    sessionsCount: 8,
    completedTopics: ["Figma"]
  },
  {
    id: "fake_user_4",
    name: "Elena Rodriguez",
    college: "Carnegie Mellon",
    major: "Software Engineering",
    avatar: PROFESSIONAL_AVATAR,
    strongSkills: ["Java", "C++", "System Design"],
    weakSkills: ["Public Speaking", "Technical Writing"],
    points: 3400,
    streak: 45,
    rank: "Grandmaster",
    skillReputation: 5.0,
    teachingScore: 4.8,
    sessionsCount: 56,
    completedTopics: ["Java", "System Design", "C++"]
  }
];

async function run() {
  for (const user of fakeUsers) {
    await setDoc(doc(db, "users", user.id), {
      ...user,
      uid: user.id
    });
  }
  console.log("Successfully seeded 4 fake users.");
  process.exit(0);
}

run().catch(console.error);
