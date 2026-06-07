import { GoogleGenAI } from '@google/genai';
import { QuizQuestion, RoadmapStep, LearningResource } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

export const geminiService = {
  generateTopicNotes: async (topic: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Create concise but comprehensive study notes for the topic: "${topic}". 
        Include the following sections using Markdown:
        1. **Simple Explanation** (in plain english)
        2. **Key Concepts** (bullet points)
        3. **Example/Code Snippet** (if applicable, else a practical real-world example)
        4. **Practice Questions** (3-5 questions to test understanding)
        
        Keep it brief and easy to read. Do not output JSON, just markdown.`
      });
      return response.text || "No notes generated.";
    } catch (e) {
      console.error(e);
      return "Failed to generate notes. Please try again.";
    }
  },

  generateQuiz: async (skill: string): Promise<QuizQuestion[]> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate a 5-question multiple choice quiz for ${skill}. Return ONLY a valid JSON array of objects with keys: "question", "options" (array of 4 strings), "correctIndex" (0-3).`
      });
      const text = response.text || '[]';
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getLearningRoadmap: async (skill: string): Promise<RoadmapStep[]> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate a 5-step learning roadmap for ${skill}. Return ONLY a valid JSON array of objects with keys: "title", "description".`
      });
      const text = response.text || '[]';
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error(e);
      return [{ title: 'Fundamentals', description: `Learn the basics of ${skill}` }];
    }
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
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `I am learning ${skills.join(', ')}. Give me a 1 sentence motivational insight about how these combine.`
      });
      return response.text || "Every session brings you closer to mastery. Keep going!";
    } catch (e) {
      return "Every session brings you closer to mastery. Keep going!";
    }
  },

  askAssistant: async (query: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: query
      });
      return response.text || "I'm having trouble right now.";
    } catch (e) {
      return "I'm having trouble right now. Please try again.";
    }
  }
};
