
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, RoadmapStep, LearningResource } from "../types";

export const geminiService = {
  generateQuiz: async (skill: string): Promise<QuizQuestion[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a 3-question multiple choice quiz for the skill: ${skill}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                correctIndex: { type: Type.INTEGER }
              },
              required: ["question", "options", "correctIndex"]
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error: any) {
      console.warn("Gemini Quiz Fallback triggered due to error:", error?.message);
      return [
        {
          question: `Which of these is a core principle of ${skill}?`,
          options: ["Abstraction", "Persistence", "Efficiency", "Modularity"],
          correctIndex: 3
        },
        {
          question: `In the context of ${skill}, what does scalability refer to?`,
          options: ["Speed of development", "Handling increased load", "Code readability", "Security protocols"],
          correctIndex: 1
        },
        {
          question: `What is the most common pitfall when starting with ${skill}?`,
          options: ["Over-engineering", "Under-testing", "Ignoring documentation", "All of the above"],
          correctIndex: 3
        }
      ];
    }
  },

  getLearningRoadmap: async (skill: string): Promise<RoadmapStep[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 4-step professional learning roadmap for ${skill}. Keep descriptions high-impact.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.warn("Gemini Roadmap Fallback triggered.");
      return [
        { title: "Foundations", description: "Master the core syntax and basic architectural principles." },
        { title: "Implementation", description: "Build real-world components to test logic and flow." },
        { title: "Optimization", description: "Refine performance and apply advanced design patterns." },
        { title: "Mastery", description: "Contribute to ecosystem projects and mentor others." }
      ];
    }
  },

  getWebResources: async (skill: string): Promise<LearningResource[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find official documentation and top tutorials for learning ${skill}.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const resources = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || "External Resource",
          uri: c.web.uri
        })).slice(0, 3);
        
      if (resources.length === 0) {
        return [{ title: `${skill} Documentation`, uri: "https://www.google.com/search?q=" + encodeURIComponent(skill + " docs") }];
      }
      return resources;
    } catch (error) {
      return [{ title: `Search ${skill} Resources`, uri: "https://www.google.com/search?q=" + encodeURIComponent(skill) }];
    }
  },

  getGrowthInsight: async (skills: string[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on a student learning ${skills.join(', ')}, provide one short, motivational 1-sentence analytical insight for their dashboard.`,
      });
      return response.text?.trim() || "Your learning momentum is high!";
    } catch (error: any) {
      return "Every session brings you closer to mastery. Keep it up!";
    }
  },

  askAssistant: async (query: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: "You are a helpful AI Mentor. Your answers must be very short and extremely easy to understand. Use simple words as if explaining to a total beginner. Avoid long paragraphs. Use 2-3 short bullet points only if necessary. Keep the total length under 3 sentences if possible. Be direct and friendly.",
        }
      });
      return response.text || "I am processing your query. Please rephrase for better results.";
    } catch (error: any) {
      return "The neural connection is currently saturated. Please try your query again in a moment.";
    }
  }
};
