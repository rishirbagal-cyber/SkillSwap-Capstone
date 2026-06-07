# SkillSwap

A peer-to-peer learning platform where students exchange skills by teaching what they know and learning what they don't. Users connect based on their strengths and weaknesses, complete quizzes after sessions, earn points, and grow together through collaborative learning.

## What it does

- Match students based on complementary skill sets
- Let users teach topics they are strong in and learn topics they struggle with
- Post-session quizzes to reinforce learning and verify knowledge transfer
- Points system to reward active participation and teaching
- AI-powered recommendations using Google Gemini
- Real-time chat messaging using Firebase Firestore
- Live online presence using Firebase Realtime Database
- Custom Learn Hub with Gemini-generated notes

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Firebase for authentication (Google Auth), database (Firestore), and presence (RTDB)
- Google Gemini AI (@google/genai)
- Recharts for data visualization
- Lucide React for icons

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Rishikesh-Bagal/SkillSwap-Capstone.git
cd SkillSwap-Capstone
```

Install dependencies:

```bash
npm install
```

Set up environment variables:

Create a `.env.local` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Run the frontend development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure
SkillSwap-Capstone/
├── components/        # Reusable UI components (Dashboard, ChatDrawer, LearnHub, etc.)
├── services/          # API and Firebase service files (firestoreService, chatService, geminiService)
├── App.tsx            # Root component
├── MainApp.tsx        # Main app layout and routing orchestrator
├── types.ts           # TypeScript type definitions
└── constants.tsx      # App-wide constants

## License

This project was built as a capstone project. Feel free to explore and learn from the code.