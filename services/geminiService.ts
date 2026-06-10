import { QuizQuestion, RoadmapStep, LearningResource } from "../types";

// ─── Singleton API Key Config ─────────────────────────────────────────────────
// Keys are read once at module load time (not per-request).
const GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_KEY_1 || "",
].filter((k) => k.length > 0);

// ─── In-flight request deduplication map ─────────────────────────────────────
// Maps a cache key -> Promise so concurrent calls for identical prompts share
// one network request instead of firing N parallel requests.
const _inFlight = new Map<string, Promise<string>>();

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Exponential backoff delay for attempt index (0-based). */
function backoffDelay(attempt: number): number {
  // 1s, 2s, 4s, 8s, 16s — capped at 30s
  return Math.min(1000 * Math.pow(2, attempt), 30_000);
}

// ─── Diagnostics & Tracking ───────────────────────────────────────────────────
let requestCount = 0;
const CURRENT_MODEL = "gemini-2.5-flash-lite";

function logDebug(action: string, details: any = {}) {
  console.log(`[GeminiService][${new Date().toISOString()}] ${action}`, details);
}

// Startup logging
logDebug("Service Initialized", {
  model: CURRENT_MODEL,
  endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${CURRENT_MODEL}:generateContent`
});

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

/**
 * Makes a single HTTP call to the Gemini REST API.
 * Returns the text content or throws on non-OK status.
 */
async function fetchGemini(
  key: string,
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CURRENT_MODEL}:generateContent?key=${key}`;
  requestCount++;
  
  // Model and Key validation logging
  const maskedKey = key.substring(0, 8) + "..." + key.slice(-4);
  logDebug("Request Initiated", { 
    reqId: requestCount, 
    model: CURRENT_MODEL, 
    key: maskedKey,
    promptLength: prompt.length
  });

  const startTime = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
    signal,
  });
  
  const duration = Date.now() - startTime;
  logDebug("Response Received", { reqId: requestCount, status: res.status, durationMs: duration });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : null;
    logDebug("Rate Limited (429)", { reqId: requestCount, retryAfter });
    const err: any = new Error(`RATE_LIMITED`);
    err.status = 429;
    err.retryAfterMs = waitMs;
    throw err;
  }

  if (res.status === 401 || res.status === 403) {
    logDebug("Authentication Error (401/403)", { reqId: requestCount, status: res.status });
    const err: any = new Error(`AUTH_ERROR`);
    err.status = res.status;
    throw err;
  }

  if (res.status >= 500) {
    logDebug("Server Error (5xx)", { reqId: requestCount, status: res.status });
    const err: any = new Error(`SERVER_ERROR`);
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    logDebug("API Error", { reqId: requestCount, status: res.status });
    const err: any = new Error(`API_ERROR:${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── Main callGemini with exponential backoff ─────────────────────────────────

const MAX_RETRIES = 4;

async function callGemini(prompt: string, signal?: AbortSignal): Promise<string> {
  if (GEMINI_KEYS.length === 0) {
    logDebug("Error", { message: "No API keys configured" });
    throw new Error("No Gemini API keys configured. Set VITE_GEMINI_KEY_1 in .env.local");
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      logDebug("Request Aborted", { attempt });
      throw new DOMException("Request aborted", "AbortError");
    }

    const key = GEMINI_KEYS[attempt % GEMINI_KEYS.length];

    try {
      return await fetchGemini(key, prompt, signal);
    } catch (err: any) {
      if (err.name === "AbortError") throw err;

      const isRateLimit = err.status === 429;
      const isServerError = err.status >= 500;
      const isRetryable = isRateLimit || isServerError;

      if (!isRetryable || attempt === MAX_RETRIES) {
        if (isRateLimit) {
          throw new Error("Gemini AI rate limit reached (429). You are on the free tier — please wait 60 seconds and try again.");
        } else if (err.status === 401 || err.status === 403) {
          throw new Error("Invalid API Key or unauthorized access. Please check your Gemini API key.");
        }
        throw err;
      }

      const delay = err.retryAfterMs ?? backoffDelay(attempt);
      logDebug("Retry Scheduled", { attempt: attempt + 1, delayMs: delay, reason: err.status });
      await sleep(delay);
    }
  }

  throw new Error("Gemini: all retry attempts exhausted.");
}

// ─── Deduplicated wrapper ─────────────────────────────────────────────────────

/**
 * Calls Gemini with in-flight deduplication.
 * If two callers request the same prompt simultaneously, only ONE HTTP
 * request is made and both callers receive the same result.
 */
function callGeminiDeduped(
  cacheKey: string,
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  if (_inFlight.has(cacheKey)) {
    return _inFlight.get(cacheKey)!;
  }

  const request = callGemini(prompt, signal).finally(() => {
    _inFlight.delete(cacheKey);
  });

  _inFlight.set(cacheKey, request);
  return request;
}

// ─── Public Service API ───────────────────────────────────────────────────────

export const geminiService = {
  /**
   * Generate study notes for a topic.
   * Deduplicated: clicking "Generate Notes" twice for the same topic
   * fires only ONE API request.
   */
  generateTopicNotes: async (
    topic: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const text = await callGeminiDeduped(
        `notes:${topic}`,
        `Create concise study notes for: "${topic}". Use Markdown with sections: Simple Explanation, Key Concepts, Example, Practice Questions (3-5).`,
        signal
      );
      return text || "No notes generated.";
    } catch (e: any) {
      if (e.name === "AbortError") throw e;
      if (e.message?.includes("rate limit")) return e.message;
      return "Failed to generate notes. Please try again in a moment.";
    }
  },

  /**
   * Generate a 10-question MCQ quiz for a skill.
   * Deduplicated: rapid double-clicks fire only one request.
   */
  generateQuiz: async (
    skill: string,
    signal?: AbortSignal
  ): Promise<QuizQuestion[]> => {
    const raw = await callGeminiDeduped(
      `quiz:${skill}`,
      `Generate a 10-question MCQ quiz for "${skill}". Return ONLY a valid JSON array of 10 objects with keys: "question" (string), "options" (array of 4 strings), "correctIndex" (number 0-3). No markdown, no explanation, just the JSON array.`,
      signal
    );
    const cleaned = (raw || "[]")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned) as QuizQuestion[];
  },

  /**
   * Generate a 5-7 step learning roadmap for a skill.
   */
  getLearningRoadmap: async (
    skill: string,
    signal?: AbortSignal
  ): Promise<RoadmapStep[]> => {
    const raw = await callGeminiDeduped(
      `roadmap:${skill}`,
      `Generate a 5-7 step learning roadmap for "${skill}". Return ONLY a valid JSON array of objects with keys: "title" (string) and "description" (string). No markdown outside JSON.`,
      signal
    );
    const cleaned = (raw || "[]")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned) as RoadmapStep[];
  },

  /**
   * Returns static curated resource links — no Gemini call needed.
   * Kept as async for API compatibility.
   */
  getWebResources: async (skill: string): Promise<LearningResource[]> => {
    return [
      {
        title: `${skill} Documentation`,
        uri: `https://www.google.com/search?q=${encodeURIComponent(skill + " docs")}`,
      },
      {
        title: `${skill} Crash Course`,
        uri: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " crash course")}`,
      },
    ];
  },

  /**
   * Motivational growth insight — called only when user explicitly requests it.
   * Falls back to a static message on failure (never retries for insight).
   */
  getGrowthInsight: async (
    skills: string[],
    signal?: AbortSignal
  ): Promise<string> => {
    if (!skills.length) return "Start learning new skills to get insights!";
    try {
      const text = await callGeminiDeduped(
        `insight:${skills.join(",")}`,
        `I am learning ${skills.join(", ")}. Give me a 1 sentence motivational insight about how these skills combine.`,
        signal
      );
      return text || "Every session brings you closer to mastery. Keep going!";
    } catch {
      return "Every session brings you closer to mastery. Keep going!";
    }
  },

  /**
   * AI Assistant chat reply.
   * Protected by the isTyping guard in AIAssistant component.
   */
  askAssistant: async (
    query: string,
    signal?: AbortSignal
  ): Promise<string> => {
    const text = await callGemini(
      `You are a helpful learning assistant for a skill-sharing app called SkillSwap. Answer this clearly and concisely: ${query}`,
      signal
    );
    return text || "I'm having trouble right now. Please try again.";
  },
};
