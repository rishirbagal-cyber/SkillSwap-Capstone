import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import prisma from "./prismaClient.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();

/* ================= CORS HARD FIX ================= */
app.use((req, res, next) => {
  const allowedOrigins = ['https://skillswap-grow.netlify.app', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "https://skillswap-grow.netlify.app");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
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

/* =======================================================
   POSTGRESQL + PRISMA ROUTES (PROTECTED BY FIREBASE AUTH)
   ======================================================= */

// Ensure a UserReference exists in Postgres (Helper function, called on protected routes if needed)
async function ensureUser(uid) {
  let userRef = await prisma.userReference.findUnique({ where: { firebaseUid: uid } });
  if (!userRef) {
    userRef = await prisma.userReference.create({ data: { firebaseUid: uid } });
  }
  return userRef;
}

// 1. Skill Swap Requests
app.post("/api/swap-requests", requireAuth, async (req, res) => {
  try {
    const { receiverUid, skillOffered, skillWanted } = req.body;
    const senderUid = req.user.uid;

    if (senderUid === receiverUid) {
      return res.status(400).json({ error: "Cannot request a swap with yourself." });
    }

    await ensureUser(senderUid);
    await ensureUser(receiverUid);

    const newRequest = await prisma.skillSwapRequest.create({
      data: {
        senderUid,
        receiverUid,
        skillOffered,
        skillWanted
      }
    });

    res.json(newRequest);
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    res.status(500).json({ error: "Failed to create request." });
  }
});

app.get("/api/swap-requests", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const requests = await prisma.skillSwapRequest.findMany({
      where: {
        OR: [ { senderUid: uid }, { receiverUid: uid } ]
      },
      include: {
        session: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error("GET REQUESTS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch requests." });
  }
});

app.patch("/api/swap-requests/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const uid = req.user.uid;

    const request = await prisma.skillSwapRequest.findUnique({ where: { id } });
    
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.receiverUid !== uid) {
      return res.status(403).json({ error: "You are not authorized to respond to this request." });
    }
    if (request.status !== "PENDING") {
      return res.status(400).json({ error: "Request already processed." });
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    
    const updatedRequest = await prisma.skillSwapRequest.update({
      where: { id },
      data: { status: newStatus }
    });

    // If accepted, auto-create a session
    if (newStatus === 'ACCEPTED') {
      await prisma.session.create({
        data: {
          requestId: id,
          tutorUid: request.receiverUid, // Simplification: Receiver is tutor initially
          learnerUid: request.senderUid
        }
      });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("PATCH REQUEST ERROR:", error);
    res.status(500).json({ error: "Failed to update request." });
  }
});

// 2. Sessions
app.get("/api/sessions", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessions = await prisma.session.findMany({
      where: {
        OR: [ { tutorUid: uid }, { learnerUid: uid } ]
      },
      include: { request: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
});

app.patch("/api/sessions/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user.uid;
    const { status } = req.body; // 'COMPLETED' or 'CANCELLED'

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ error: "Session not found." });
    if (session.tutorUid !== uid && session.learnerUid !== uid) {
      return res.status(403).json({ error: "Unauthorized access to session." });
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: { status }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error("PATCH SESSION ERROR:", error);
    res.status(500).json({ error: "Failed to update session." });
  }
});

// 3. Reviews & XP
app.post("/api/reviews", requireAuth, async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;
    const reviewerUid = req.user.uid;

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== "COMPLETED") {
      return res.status(400).json({ error: "Can only review completed sessions." });
    }
    if (session.tutorUid !== reviewerUid && session.learnerUid !== reviewerUid) {
      return res.status(403).json({ error: "You were not part of this session." });
    }

    const revieweeUid = session.tutorUid === reviewerUid ? session.learnerUid : session.tutorUid;

    const review = await prisma.review.create({
      data: {
        sessionId,
        reviewerUid,
        revieweeUid,
        rating,
        comment
      }
    });

    // Award XP
    const xpAmount = rating * 10; // Simple XP logic
    await prisma.xpTransaction.create({
      data: {
        userUid: revieweeUid,
        amount: xpAmount,
        reason: `Received a ${rating}-star review for session ${sessionId}`
      }
    });

    await prisma.userReference.update({
      where: { firebaseUid: revieweeUid },
      data: { totalXp: { increment: xpAmount } }
    });

    res.json(review);
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    res.status(500).json({ error: "Failed to create review or you already reviewed this session." });
  }
});

// 4. Leaderboard
app.get("/api/leaderboard", async (req, res) => {
  // Can optionally be protected or public. We'll make it public for now, 
  // but it queries Postgres for the rankings.
  try {
    const leaderboard = await prisma.userReference.findMany({
      orderBy: { totalXp: 'desc' },
      take: 10,
      select: {
        firebaseUid: true,
        totalXp: true
      }
    });
    res.json(leaderboard);
  } catch (error) {
    console.error("GET LEADERBOARD ERROR:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Server running on port ${PORT}`);
});
