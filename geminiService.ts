
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

export const geminiService = {
  generateQuiz: async (skill: string): Promise<QuizQuestion[]> => {
    // Create a new instance right before making an API call to ensure it uses the latest key.
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
      
      // If quota is exhausted, we provide mock data so the user can still test the flow.
      if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn("Quota exhausted. Using fallback quiz questions. Please select a personal API key if this persists.");
      }

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
      return response.text?.trim() || "Keep pushing your boundaries in " + skills[0] + "!";
    } catch (error: any) {
      if (error?.message?.includes('429')) {
        return "Your learning momentum is high! Consider switching to a personal API key for uninterrupted insights.";
      }
      return "Every session brings you closer to mastery. Keep it up!";
    }
  }
};
