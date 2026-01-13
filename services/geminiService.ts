import { QuizQuestion, RoadmapStep, LearningResource } from "../types";

const API_BASE = "http://localhost:5000";


export const geminiService = {
  generateQuiz: async (skill: string): Promise<QuizQuestion[]> => {
    const res = await fetch(`${API_BASE}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill })
    });

    if (!res.ok) throw new Error("Quiz request failed");
    return res.json();
  },

  getLearningRoadmap: async (skill: string): Promise<RoadmapStep[]> => {
    const res = await fetch(`${API_BASE}/api/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill })
    });

    if (!res.ok) throw new Error("Roadmap request failed");
    return res.json();
  },

  getWebResources: async (skill: string): Promise<LearningResource[]> => {
    const res = await fetch(`${API_BASE}/api/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill })
    });

    if (!res.ok) {
      return [{ title: `${skill} Documentation`, uri: "https://www.google.com/search?q=" + encodeURIComponent(skill + " docs") }];
    }

    return res.json();
  },

  getGrowthInsight: async (skills: string[]): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills })
    });

    if (!res.ok) return "Every session brings you closer to mastery. Keep going!";
    const data = await res.json();
    return data.message;
  },

  askAssistant: async (query: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!res.ok) return "I'm having trouble right now. Please try again.";
    const data = await res.json();
    return data.message;
  }
};
