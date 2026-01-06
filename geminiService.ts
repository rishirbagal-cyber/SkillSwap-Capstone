
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "./types";

export const geminiService = {
  generateQuiz: async (skill: string): Promise<QuizQuestion[]> => {
    // Standard initialization as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
      console.error("Gemini Quiz Error:", error);
      
      // Fallback data if API fails
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

  getGrowthInsight: async (skills: string[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: "You are a friendly AI Mentor. You MUST answer in 1-2 very short sentences. Use extremely simple words for a beginner. No complex jargon. If you need to list something, use only 2 bullet points. Be professional but very concise.",
        }
      });
      return response.text || "I am processing your query. Please rephrase for better results.";
    } catch (error: any) {
      console.error("Assistant Error:", error);
      return "The connection is currently busy. Please try again in a moment.";
    }
  }
};
