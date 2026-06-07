import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

/* ================= CORS HARD FIX ================= */
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});
/* ================================================ */

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || "";
let aiClient = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
  console.log("Loaded Gemini API Key:", apiKey.slice(0, 5) + "...");
} else {
  console.warn("⚠️ WARNING: GEMINI_API_KEY is not set in .env! Using Mock AI responses so the UI remains fully working. Please add GEMINI_API_KEY to .env for real responses.");
}

async function generateAIResponse(prompt) {
  if (aiClient) {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  }
  
  // Mock fallback logic based on prompt keywords:
  if (prompt.includes("multiple-choice quiz")) {
    return JSON.stringify([
      { question: "What is the primary purpose of this skill?", options: ["To build things", "To break things", "To eat things", "To sleep"], correctIndex: 0 },
      { question: "Which tool is commonly associated with this?", options: ["Hammer", "Compiler", "Screwdriver", "Oven"], correctIndex: 1 },
      { question: "How long does it take to master?", options: ["1 Day", "1 Week", "Years of practice", "Never"], correctIndex: 2 }
    ]);
  } else if (prompt.includes("learning roadmap")) {
    return JSON.stringify([
      { title: "Step 1: The Basics", description: "Learn the fundamental concepts and setup your environment." },
      { title: "Step 2: Core Features", description: "Dive deeper into the main features and build simple projects." },
      { title: "Step 3: Advanced Topics", description: "Understand the complex parts and start building real-world applications." },
      { title: "Step 4: Mastery", description: "Contribute to open source, build complex systems, and share your knowledge." }
    ]);
  } else {
    return "This is a mock response because the GEMINI_API_KEY is not set. The UI is fully working! To get real AI responses, add a valid Gemini API key to your backend's .env file.";
  }
}

// 🧠 Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;
    const text = await generateAIResponse(query);
    res.json({ message: text });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

// 🧪 Quiz
app.post("/api/quiz", async (req, res) => {
  try {
    const { skill } = req.body;
    const prompt = `Create a 3-question multiple-choice quiz about "${skill}".
Return ONLY valid JSON in this format:
[
  { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }
]`;
    const text = await generateAIResponse(prompt);
    // Remove markdown code blocks if the AI includes them
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(cleanJson);
    res.json(json);
  } catch (error) {
    console.error("QUIZ ERROR:", error);
    res.json([
      {
        question: `Which of these best describes ${req.body.skill}?`,
        options: ["Concept", "Tool", "Framework", "Language"],
        correctIndex: 0
      }
    ]);
  }
});

// 🗺️ Roadmap
app.post("/api/roadmap", async (req, res) => {
  try {
    const { skill } = req.body;
    const prompt = `Create a 4-step professional learning roadmap for "${skill}".
Return ONLY valid JSON in this format:
[
  { "title": "...", "description": "..." }
]`;
    const text = await generateAIResponse(prompt);
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(cleanJson);
    res.json(json);
  } catch (error) {
    console.error("ROADMAP ERROR:", error);
    res.json([
      { title: "Foundations", description: `Learn the basics of ${req.body.skill}.` },
      { title: "Core Skills", description: `Practice essential concepts of ${req.body.skill}.` },
      { title: "Projects", description: `Build real-world projects using ${req.body.skill}.` },
      { title: "Mastery", description: `Advance your expertise in ${req.body.skill}.` }
    ]);
  }
});

// 🌐 Resources
app.post("/api/resources", (req, res) => {
  const { skill } = req.body;
  res.json([
    { title: `${skill} Documentation`, uri: `https://www.google.com/search?q=${skill}+documentation` },
    { title: `${skill} Tutorial`, uri: `https://www.youtube.com/results?search_query=${skill}+tutorial` },
    { title: `${skill} Course`, uri: `https://www.udemy.com/courses/search/?q=${skill}` }
  ]);
});

// 🚀 Insight
app.post("/api/insight", (req, res) => {
  const { skills } = req.body;
  res.json({ message: `You're progressing well in ${skills ? skills.join(", ") : "your skills"}. Keep building and practicing daily.` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Server running on port ${PORT}`);
});
