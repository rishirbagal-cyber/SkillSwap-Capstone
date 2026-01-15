import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://skillswap-grow.netlify.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("/api/*", cors(corsOptions));

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log("Loaded API Key:", process.env.OPENAI_API_KEY?.slice(0, 10));

// 🧠 Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: query
    });

    res.json({ message: response.output_text });
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

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const json = JSON.parse(response.output_text);
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

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const json = JSON.parse(response.output_text);
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
  res.json({ message: `You're progressing well in ${skills.join(", ")}. Keep building and practicing daily.` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Server running on port ${PORT}`);
});
