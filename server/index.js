import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

console.log("Loaded API Key:", process.env.OPENAI_API_KEY?.slice(0, 10));

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://skillswap-grow.netlify.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log("➡️", req.method, req.url, req.body);
  next();
});


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// 🧠 Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;
    console.log("Incoming chat:", req.body);


    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: query }]
    });

    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error("CHAT ERROR FULL:", error);
    res.status(500).json({ error: error?.message || "AI chat failed" });
  }  
});


// 🧪 Quiz
app.post("/api/quiz", async (req, res) => {
  try {
    const { skill } = req.body;
    console.log("Incoming quiz:", skill);

    const prompt = `Create a 3-question multiple-choice quiz about "${skill}".
Return ONLY valid JSON in this format:
[
 { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }
]`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const raw = response.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);
  } catch (err) {
    console.error("QUIZ ERROR:", err.message);
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
    console.log("Incoming roadmap:", skill);

    const prompt = `Create a 4-step professional learning roadmap for "${skill}".
Return ONLY valid JSON in this format:
[
 { "title": "...", "description": "..." }
]`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const raw = response.choices[0].message.content;
    const json = JSON.parse(raw);

    res.json(json);
  } catch (err) {
    console.error("ROADMAP ERROR:", err.message);
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
