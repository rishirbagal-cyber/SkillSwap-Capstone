import { QuizQuestion, RoadmapStep, LearningResource } from "../types";

const GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_KEY_1 || "",
  import.meta.env.VITE_GEMINI_KEY_2 || "",
  import.meta.env.VITE_GEMINI_KEY_3 || "",
].filter(k => k.length > 0);

let currentKeyIndex = 0;

async function callGemini(prompt: string): Promise<string> {
  if (GEMINI_KEYS.length === 0) throw new Error("No API keys configured.");
  
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[currentKeyIndex];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      if (res.status === 429 || res.status === 503) {
        currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
        continue;
      }
      
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e: any) {
      if (i < GEMINI_KEYS.length - 1) {
        currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
        continue;
      }
      throw e;
    }
  }
  throw new Error("All keys exhausted.");
}

export const geminiService = {
  generateTopicNotes: async (topic: string): Promise<string> => {
    try {
      const responseText = await callGemini(`Create concise study notes for: "${topic}". Use Markdown with sections: Simple Explanation, Key Concepts, Example, Practice Questions (3-5).`);
      return responseText || "No notes generated.";
    } catch (e) {
      return "Failed to generate notes. Please try again.";
    }
  },

  generateQuiz: async (skill: string): Promise<QuizQuestion[]> => {
    const responseText = await callGemini(`Generate a 10-question MCQ quiz for "${skill}". Return ONLY a valid JSON array of 10 objects with keys: "question" (string), "options" (array of 4 strings), "correctIndex" (number 0-3). No markdown, no explanation, just the JSON array.`);
    const text = (responseText || '[]').replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  },

  getLearningRoadmap: async (skill: string): Promise<RoadmapStep[]> => {
    const responseText = await callGemini(`Generate a 5-7 step learning roadmap for "${skill}". Return ONLY a valid JSON array of objects with keys: "title" (string) and "description" (string). No markdown outside JSON.`);
    const text = (responseText || '[]').replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  },

  getWebResources: async (skill: string): Promise<LearningResource[]> => {
    return [
      { title: `${skill} Documentation`, uri: `https://www.google.com/search?q=${encodeURIComponent(skill + " docs")}` },
      { title: `${skill} Crash Course`, uri: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " crash course")}` }
    ];
  },

  getGrowthInsight: async (skills: string[]): Promise<string> => {
    if (!skills.length) return "Start learning new skills to get insights!";
    try {
      const responseText = await callGemini(`I am learning ${skills.join(', ')}. Give me a 1 sentence motivational insight about how these skills combine.`);
      return responseText || "Every session brings you closer to mastery. Keep going!";
    } catch (e) {
      return "Every session brings you closer to mastery. Keep going!";
    }
  },

  askAssistant: async (query: string): Promise<string> => {
    try {
      const responseText = await callGemini(`You are a helpful learning assistant. Answer this clearly and concisely: ${query}`);
      return responseText || "I'm having trouble right now.";
    } catch (e) {
      return "I'm having trouble right now. Please try again.";
    }
  }
};
