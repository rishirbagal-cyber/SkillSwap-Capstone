import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";

app.use(cors({
  origin: "https://skillswap-grow.netlify.app",
  methods: ["GET", "POST"],
  credentials: true
}));


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Server running on port ${PORT}`);
});

